import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recipe, RecipeStatus } from './entities/recipe.entities';
import { SearchRecipeQueryDto, CreateRecipeDto, UpdateRecipeDto } from './recipe.dto';
import { RecipeCategoryMapping } from '../recipe_category_mapping/entities/recipe_category_mapping.entities';
import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
import { CookingStep } from '../cooking_step/entities/cooking_step.entities';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';
import { Express } from 'express';
import { RecipeLike } from '../recipe_like/entities/recipe_like.entities';
import { ViewHistory } from '../view_history/entities/view_history.entities';
import { FavoriteRecipe } from '../favorite_recipe/entities/favorite_recipe.entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepo: Repository<Recipe>,
    @InjectRepository(RecipeCategoryMapping)
    private categoryMappingRepo: Repository<RecipeCategoryMapping>,
    @InjectRepository(RecipeIngredient)
    private ingredientRepo: Repository<RecipeIngredient>,
    @InjectRepository(CookingStep)
    private stepRepo: Repository<CookingStep>,
    @InjectRepository(RecipeLike)
    private recipeLikeRepo:Repository<RecipeLike>,
    @InjectRepository(ViewHistory)
    private viewHistoryRepo:Repository<ViewHistory>,
    @InjectRepository(FavoriteRecipe)
    private favoriteRecipeRepo:Repository<FavoriteRecipe>,
    private dataSource: DataSource,
    private cloudinaryService: CloudinaryService,

  ) {}

  async searchRecipes(queryDto: SearchRecipeQueryDto) {
    const { query, status, offset = 0, limit = 10 } = queryDto;
  
    const qb = this.recipeRepo.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.account', 'account')
      .leftJoinAndSelect('recipe.categoryMappings', 'categoryMappings')
      .leftJoinAndSelect('categoryMappings.recipeCategory', 'category');
  
    if (query) {
      qb.andWhere('LOWER(recipe.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      });
    }
  
    if (status) {
      qb.andWhere('recipe.status = :status', { status });
    }
  
    // Thêm GROUP BY cho tất cả các cột cần thiết
    qb.groupBy('recipe.id')
      .addGroupBy('account.id')
      .addGroupBy('categoryMappings.recipe_id')
      .addGroupBy('categoryMappings.recipe_category_id')
      .addGroupBy('category.id');
  
    const [data, total] = await qb
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  
    return {
      data,
      total,
    };
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const result = await this.recipeRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async createRecipe(dto: CreateRecipeDto, accountId: string) {
    console.log('Creating recipe with DTO:', JSON.stringify(dto, null, 2));
    console.log('Account ID:', accountId);

    // Validate input
    if (!dto.name || !dto.categoryIds || dto.categoryIds.length === 0) {
      throw new BadRequestException('Tên công thức và danh mục là bắt buộc');
    }

    if (!dto.ingredients || dto.ingredients.length === 0) {
      throw new BadRequestException('Công thức phải có ít nhất một nguyên liệu');
    }

    if (!dto.steps || dto.steps.length === 0) {
      throw new BadRequestException('Công thức phải có ít nhất một bước nấu');
    }

    // Validate ingredients
    for (const ing of dto.ingredients) {
      if (!ing.ingredientId) {
        throw new BadRequestException('Mỗi nguyên liệu phải có ID');
      }
      if (ing.quantity === null || ing.quantity === undefined) {
        throw new BadRequestException('Mỗi nguyên liệu phải có số lượng');
      }
      if (!ing.unitId) {
        throw new BadRequestException('Mỗi nguyên liệu phải có đơn vị đo lường');
      }
    }

    // Validate steps
    for (const step of dto.steps) {
      if (!step.stepOrder) {
        throw new BadRequestException('Mỗi bước phải có thứ tự');
      }
      if (!step.instruction) {
        throw new BadRequestException('Mỗi bước phải có hướng dẫn');
      }
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate UUID for recipe
      const recipeId = uuidv4();

      // 1. Tạo recipe
      const recipe = this.recipeRepo.create({
        id: recipeId,
        ...dto,
        accountId,
        status: dto.status,
      });
      const savedRecipe = await queryRunner.manager.save(Recipe, recipe);
      console.log('Saved recipe:', savedRecipe);

      // 2. Lưu categories
      const categoryMappings = dto.categoryIds.map(categoryId => ({
        recipeId: savedRecipe.id,
        recipeCategoryId: categoryId,
      }));
      await queryRunner.manager.save(RecipeCategoryMapping, categoryMappings);
      console.log('Saved category mappings:', categoryMappings);

      // 3. Lưu ingredients
      const ingredients = dto.ingredients.map(ing => ({
        recipeId: savedRecipe.id,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unitId: ing.unitId,
      }));
      await queryRunner.manager.save(RecipeIngredient, ingredients);
      console.log('Saved ingredients:', ingredients);

      // 4. Lưu steps
      const steps = dto.steps.map(step => ({
        recipeId: savedRecipe.id,
        stepOrder: step.stepOrder,
        instruction: step.instruction,
        imageUrl: step.imageUrl,
      }));
      await queryRunner.manager.save(CookingStep, steps);
      console.log('Saved steps:', steps);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return full recipe data
      const fullRecipe = await this.recipeRepo.findOne({
        where: { id: savedRecipe.id },
        relations: {
          categoryMappings: {
            recipeCategory: true
          },
          recipeIngredients: {
            ingredient: true,
            unit: true
          },
          cookingSteps: true
        }
      });
      console.log("Recipe created successfully:", fullRecipe);
      return {
        message: 'Tạo công thức thành công',
        data: fullRecipe
      };

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Error creating recipe:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      throw new InternalServerErrorException('Không thể tạo công thức: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async updateRecipe(dto: UpdateRecipeDto, accountId: string) {
    console.log('Updating recipe with DTO:', JSON.stringify(dto, null, 2));
    console.log('Account ID:', accountId);

    // Validate input
    if (!dto.id) {
      throw new BadRequestException('ID công thức là bắt buộc');
    }

    if (!dto.name || !dto.categoryIds || dto.categoryIds.length === 0) {
      throw new BadRequestException('Tên công thức và danh mục là bắt buộc');
    }

    if (!dto.ingredients || dto.ingredients.length === 0) {
      throw new BadRequestException('Công thức phải có ít nhất một nguyên liệu');
    }

    if (!dto.steps || dto.steps.length === 0) {
      throw new BadRequestException('Công thức phải có ít nhất một bước nấu');
    }

    // Validate ingredients
    for (const ing of dto.ingredients) {
      if (!ing.ingredientId) {
        throw new BadRequestException('Mỗi nguyên liệu phải có ID');
      }
      if (ing.quantity === null || ing.quantity === undefined) {
        throw new BadRequestException('Mỗi nguyên liệu phải có số lượng');
      }
      if (!ing.unitId) {
        throw new BadRequestException('Mỗi nguyên liệu phải có đơn vị đo lường');
      }
    }

    // Validate steps
    for (const step of dto.steps) {
      if (!step.stepOrder) {
        throw new BadRequestException('Mỗi bước phải có thứ tự');
      }
      if (!step.instruction) {
        throw new BadRequestException('Mỗi bước phải có hướng dẫn');
      }
    }

    // Check if recipe exists
    const existingRecipe = await this.recipeRepo.findOne({
      where: { id: dto.id },
      relations: ['categoryMappings', 'recipeIngredients', 'cookingSteps']
    });

    if (!existingRecipe) {
      throw new NotFoundException(`Không tìm thấy công thức với id: ${dto.id}`);
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Update recipe
      const recipe = this.recipeRepo.create({
        ...dto,
        accountId,
        status: dto.status,
      });
      const updatedRecipe = await queryRunner.manager.save(Recipe, recipe);
      console.log('Updated recipe:', updatedRecipe);

      // 2. Update categories
      // Delete existing mappings
      await queryRunner.manager.delete(RecipeCategoryMapping, { recipeId: dto.id });
      // Create new mappings
      const categoryMappings = dto.categoryIds.map(categoryId => ({
        recipeId: updatedRecipe.id,
        recipeCategoryId: categoryId,
      }));
      await queryRunner.manager.save(RecipeCategoryMapping, categoryMappings);
      console.log('Updated category mappings:', categoryMappings);

      // 3. Update ingredients
      // Delete existing ingredients
      await queryRunner.manager.delete(RecipeIngredient, { recipeId: dto.id });
      // Create new ingredients
      const ingredients = dto.ingredients.map(ing => ({
        recipeId: updatedRecipe.id,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unitId: ing.unitId,
      }));
      await queryRunner.manager.save(RecipeIngredient, ingredients);
      console.log('Updated ingredients:', ingredients);

      // 4. Update steps
      // Delete existing steps
      await queryRunner.manager.delete(CookingStep, { recipeId: dto.id });
      // Create new steps
      const steps = dto.steps.map(step => ({
        recipeId: updatedRecipe.id,
        stepOrder: step.stepOrder,
        instruction: step.instruction,
        imageUrl: step.imageUrl,
      }));
      await queryRunner.manager.save(CookingStep, steps);
      console.log('Updated steps:', steps);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return full recipe data
      const fullRecipe = await this.recipeRepo.findOne({
        where: { id: updatedRecipe.id },
        relations: {
          categoryMappings: {
            recipeCategory: true
          },
          recipeIngredients: {
            ingredient: true,
            unit: true
          },
          cookingSteps: true
        }
      });
      console.log("Recipe updated successfully:", fullRecipe);
      return {
        message: 'Cập nhật công thức thành công',
        data: fullRecipe
      };

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Error updating recipe:', error);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      throw new InternalServerErrorException('Không thể cập nhật công thức: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findByIdWithStats(id: string) {
    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: ['account','account.userProfile', 'categoryMappings', 'categoryMappings.recipeCategory', 'recipeIngredients','recipeIngredients.ingredient','recipeIngredients.unit', 'cookingSteps'],
    });
  
    if (!recipe) {
      throw new NotFoundException(`Không tìm thấy công thức với id: ${id}`);
    }
  
    // Đếm like
    const totalLikes = await this.recipeLikeRepo.count({ where: { recipe: { id } } });
  
    // Đếm favorites
    const totalFavorites = await this.favoriteRecipeRepo.count({ where: { recipe: { id } } });
  
    // Đếm views
    const totalViews = await this.viewHistoryRepo.count({ where: { recipe: { id } } });
  
    return {
      ...recipe,
      totalLikes,
      totalFavorites,
      totalViews,
    };
  }

  async getRecipeDetailForUser(id: string, accountId?: string, increaseView = true) {
    const recipe = await this.recipeRepo.findOne({
      where: { 
        id,
        status: RecipeStatus.PUBLIC // Chỉ lấy công thức công khai
      },
      relations: [
        'account',
        'account.userProfile',
        'categoryMappings',
        'categoryMappings.recipeCategory',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'recipeIngredients.unit',
        'cookingSteps'
      ],
    });

    if (!recipe) {
      throw new NotFoundException(`Không tìm thấy công thức với id: ${id}`);
    }

    // Đếm like
// Đếm likes
const totalLikes = await this.recipeLikeRepo.count({
  where: { recipeId: id }
});

// Đếm favorites
const totalFavorites = await this.favoriteRecipeRepo.count({
  where: { recipeId: id }
});

// Đếm views
const totalViews = await this.viewHistoryRepo.count({
  where: { recipeId: id }
});


    // Kiểm tra xem công thức có phải là favorite của người dùng hiện tại không
    let isFavorite = false;
    // Kiểm tra xem người dùng đã like công thức này chưa
    let isLiked = false;
    if (accountId) {
      // Kiểm tra favorite
      const favorite = await this.favoriteRecipeRepo.findOne({
        where: {
          recipeId: id,
          accountId: accountId
        }
      });
      isFavorite = !!favorite;
      
      // Kiểm tra like
      const like = await this.recipeLikeRepo.findOne({
        where: {
          recipeId: id ,
          accountId: accountId
        }
      });
      isLiked = !!like;
    }

    // Tăng lượt xem cho tất cả người dùng
    if (increaseView) {
      await this.viewHistoryRepo.save({
        accountId: accountId || null,
        recipeId: id,
        viewedAt: new Date()
      });
    }

    return {
      ...recipe,
      totalLikes,
      totalFavorites,
      totalViews,
      isFavorite,
      isLiked
    };
  }

  async getRecipeById(id: string) {
    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: ['account', 'categoryMappings', 'categoryMappings.recipeCategory', 'recipeIngredients','recipeIngredients.ingredient','recipeIngredients.unit', 'cookingSteps'],
    });
    return recipe;
  }

  async getRandomRecipe() {
    const recipe = await this.recipeRepo
      .createQueryBuilder('recipe')
      .where('recipe.status = :status', { status: 'public' })
      .andWhere('recipe.imageUrl IS NOT NULL')
      .andWhere('recipe.description IS NOT NULL')
      .orderBy('RAND()')
      .getOne();

    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức phù hợp');
    }
    return {
      message: 'Lấy công thức thành công',
      data: {
        id: recipe.id,
        imageUrl: recipe.imageUrl,
        description: recipe.description,
      }
    };
  }

  async getPopularRecipes(accountId?: string) {
    const qb = this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.account', 'account')
      .leftJoinAndSelect('account.userProfile', 'userProfile')
      .leftJoinAndSelect('recipe.categoryMappings', 'categoryMappings')
      .leftJoinAndSelect('categoryMappings.recipeCategory', 'category')
      .where('recipe.status = :status', { status: 'public' });

    if (accountId) {
      qb.leftJoin('recipe.favorites', 'userFavorite', 'userFavorite.accountId = :accountId', { accountId })
        .addSelect('CASE WHEN userFavorite.accountId IS NOT NULL THEN true ELSE false END', 'recipe_isFavorite');
    }

    // Sử dụng subquery để tính điểm
    const scoreSubquery = this.recipeRepo
      .createQueryBuilder('r')
      .select(`
        COUNT(DISTINCT v.id) * 0.5 + 
        COUNT(DISTINCT CONCAT(l.accountId, l.recipeId)) * 2 + 
        COUNT(DISTINCT CONCAT(f.accountId, f.recipeId)) * 3
      `)
      .leftJoin('r.viewHistories', 'v')
      .leftJoin('r.likes', 'l')
      .leftJoin('r.favorites', 'f')
      .where('r.id = recipe.id');

    qb.addSelect(`(${scoreSubquery.getQuery()})`, 'recipe_score')
      .setParameters(scoreSubquery.getParameters())
      .orderBy('recipe_score', 'DESC')
      .take(5);

    const recipes = await qb.getRawAndEntities();
    
    const recipesWithFavorite = recipes.entities.map((recipe, index) => ({
      ...recipe,
      isFavorite: accountId ? recipes.raw[index].recipe_isFavorite : false,
    }));

    return {
      message: 'Lấy danh sách công thức phổ biến thành công',
      data: recipesWithFavorite,
    };
  }
  

  async getTopRecipesByCategory(categoryId: number, accountId?: string) {
    const qb = this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.account', 'account')
      .leftJoinAndSelect('account.userProfile', 'userProfile')
      .leftJoinAndSelect('recipe.categoryMappings', 'categoryMappings')
      .leftJoinAndSelect('categoryMappings.recipeCategory', 'category')
      .where('recipe.status = :status', { status: 'public' })
      .andWhere('category.id = :categoryId', { categoryId });

    if (accountId) {
      qb.leftJoin('recipe.favorites', 'userFavorite', 'userFavorite.accountId = :accountId', { accountId })
        .addSelect('CASE WHEN userFavorite.accountId IS NOT NULL THEN true ELSE false END', 'recipe_isFavorite');
    }

    // Sử dụng subquery để tính điểm
    const scoreSubquery = this.recipeRepo
      .createQueryBuilder('r')
      .select(`
        COUNT(DISTINCT v.id) * 0.5 + 
        COUNT(DISTINCT CONCAT(l.accountId, l.recipeId)) * 2 + 
        COUNT(DISTINCT CONCAT(f.accountId, f.recipeId)) * 3
      `)
      .leftJoin('r.viewHistories', 'v')
      .leftJoin('r.likes', 'l')
      .leftJoin('r.favorites', 'f')
      .where('r.id = recipe.id');

    qb.addSelect(`(${scoreSubquery.getQuery()})`, 'recipe_score')
      .setParameters(scoreSubquery.getParameters())
      .orderBy('recipe_score', 'DESC')
      .take(4);

    const recipes = await qb.getRawAndEntities();
    
    const recipesWithFavorite = recipes.entities.map((recipe, index) => ({
      ...recipe,
      isFavorite: accountId ? recipes.raw[index].recipe_isFavorite : false,
    }));

    return {
      message: 'Lấy danh sách công thức nổi bật theo danh mục thành công',
      data: recipesWithFavorite,
    };
  }
}
