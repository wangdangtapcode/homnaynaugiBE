import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets, Raw } from 'typeorm';
import { Recipe, RecipeStatus } from './entities/recipe.entities';
import {
  SearchRecipeQueryDto,
  CreateRecipeDto,
  UpdateRecipeDto,
  SearchRecipeQueryAndCategoryDto,
} from './recipe.dto';
import { RecipeCategoryMapping } from '../recipe_category_mapping/entities/recipe_category_mapping.entities';
import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
import { CookingStep } from '../cooking_step/entities/cooking_step.entities';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';
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
    private recipeLikeRepo: Repository<RecipeLike>,
    @InjectRepository(ViewHistory)
    private viewHistoryRepo: Repository<ViewHistory>,
    @InjectRepository(FavoriteRecipe)
    private favoriteRecipeRepo: Repository<FavoriteRecipe>,
    private dataSource: DataSource,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getTopFavoriteRecipes(limit = 5): Promise<Recipe[]> {
    return this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoin('recipe.favorites', 'favorite') // dùng relation OneToMany
      .groupBy('recipe.id')
      .orderBy('COUNT(favorite.account_id)', 'DESC')
      .limit(limit)
      .getMany();
  }

  async searchRecipesMe(queryDto: SearchRecipeQueryDto) {
    const { query, status, accountId, offset = 0, limit = 10 } = queryDto;

    // Build query builder
    const queryBuilder = this.recipeRepo.createQueryBuilder('recipe')
      .leftJoin('recipe.viewHistories', 'viewHistory')
      .leftJoin('recipe.likes', 'recipeLike')
      .leftJoin('recipe.favorites', 'favoriteRecipe')
      .select([
        'recipe.id as recipe_id',
        'recipe.name as recipe_name',
        'recipe.status as recipe_status',
        'recipe.imageUrl as recipe_imageUrl',
        'recipe.preparationTimeMinutes as recipe_preparationTimeMinutes',
        'recipe.description as recipe_description',
        'recipe.createdAt as recipe_createdAt',
        'COUNT(DISTINCT viewHistory.id) as viewCount',
        'COUNT(DISTINCT CONCAT(recipeLike.accountId, \'-\', recipeLike.recipeId)) as likeCount',
        'COUNT(DISTINCT CONCAT(favoriteRecipe.accountId, \'-\', favoriteRecipe.recipeId)) as favoriteCount'
      ])
      .groupBy('recipe.id')
      .addGroupBy('recipe.name')
      .addGroupBy('recipe.status')
      .addGroupBy('recipe.imageUrl')
      .addGroupBy('recipe.preparationTimeMinutes')
      .addGroupBy('recipe.description')
      .addGroupBy('recipe.createdAt');

    // Lọc theo accountId nếu có
    if (accountId) {
      queryBuilder.andWhere('recipe.accountId = :accountId', { accountId });
    }

    // Lọc theo query và status
    if (query) {
      queryBuilder.andWhere('recipe.name LIKE :query', { query: `%${query}%` });
    }

    if (status) {
      queryBuilder.andWhere('recipe.status = :status', { status });
    }

    // Add pagination and ordering
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('recipe.createdAt', 'DESC');

    // Execute query
    const rawResults = await queryBuilder.getRawMany();
    const total = rawResults.length;

    const data = rawResults.map(row => ({
      id: row.recipe_id,
      name: row.recipe_name,
      status: row.recipe_status,
      imageUrl: row.recipe_imageUrl,
      preparationTimeMinutes: row.recipe_preparationTimeMinutes || 0,
      description: row.recipe_description,
      createdAt: row.recipe_createdAt,
      viewCount: Number(row.viewCount || 0),
      likeCount: Number(row.likeCount || 0),
      favoriteCount: Number(row.favoriteCount || 0)
    }));

    return {
      data,
      total,
      offset,
      limit,
    };
  }

  async searchRecipes(queryDto: SearchRecipeQueryDto) {
    const { query, status, accountId, offset = 0, limit = 10 } = queryDto;

    const qb = this.recipeRepo
    .createQueryBuilder('recipe')
    .leftJoinAndSelect('recipe.account', 'account')
    .leftJoinAndSelect('recipe.categoryMappings', 'categoryMappings')
    .leftJoinAndSelect('categoryMappings.recipeCategory', 'category');

    // Build query builder
    const queryBuilder = this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoin('recipe.viewHistories', 'viewHistory')
      .leftJoin('recipe.likes', 'recipeLike')
      .leftJoin('recipe.favorites', 'favoriteRecipe')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredient')
      .leftJoinAndSelect('recipeIngredient.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.categoryMappings', 'recipeCategoryMapping')
      .leftJoinAndSelect('recipeCategoryMapping.recipeCategory', 'category')
      .where('recipe.name LIKE :kw', { kw: `%${queryDto}%` })
      .orWhere('ingredient.name LIKE :kw', { kw: `%${queryDto}%` })
      .orWhere('category.name LIKE :kw', { kw: `%${queryDto}%` })
      .andWhere('recipe.status = :status', { status: 'public' })
      .select([
        'recipe.id as recipe_id',
        'recipe.name as recipe_name',
        'recipe.status as recipe_status',
        'recipe.imageUrl as recipe_imageUrl',
        'recipe.preparationTimeMinutes as recipe_preparationTimeMinutes',
        'recipe.description as recipe_description',
        'recipe.createdAt as recipe_createdAt',
        'COUNT(DISTINCT viewHistory.id) as viewCount',
        'COUNT(DISTINCT CONCAT(recipeLike.accountId, \'-\', recipeLike.recipeId)) as likeCount',
        'COUNT(DISTINCT CONCAT(favoriteRecipe.accountId, \'-\', favoriteRecipe.recipeId)) as favoriteCount'
      ])
      .groupBy('recipe.id')
      .addGroupBy('recipe.name')
      .addGroupBy('recipe.status')
      .addGroupBy('recipe.imageUrl')
      .addGroupBy('recipe.preparationTimeMinutes')
      .addGroupBy('recipe.description')
      .addGroupBy('recipe.createdAt');

    // Lọc theo accountId nếu có
    if (accountId) {
      queryBuilder.andWhere('recipe.accountId = :accountId', { accountId });
    }

    // Lọc theo query và status
    if (query) {
      qb.andWhere('LOWER(recipe.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      });
    }

    if (status) {
      qb.andWhere('recipe.status = :status', { status });
    }

    // Add pagination and ordering
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('recipe.createdAt', 'DESC');

    // Execute query
    const rawResults = await queryBuilder.getRawMany();
    const total = rawResults.length;

    const data = rawResults.map(row => ({
      id: row.recipe_id,
      name: row.recipe_name,
      status: row.recipe_status,
      imageUrl: row.recipe_imageUrl,
      preparationTimeMinutes: row.recipe_preparationTimeMinutes || 0,
      description: row.recipe_description,
      createdAt: row.recipe_createdAt,
      viewCount: Number(row.viewCount || 0),
      likeCount: Number(row.likeCount || 0),
      favoriteCount: Number(row.favoriteCount || 0)
    }));

    return {
      data,
      total,
    };
  }

  async searchRecipes2(queryDto: SearchRecipeQueryAndCategoryDto) {
    const { query, categoryId, offset = 0, limit = 10 } = queryDto;

    const qb = this.recipeRepo
    .createQueryBuilder('recipe')
    .leftJoinAndSelect('recipe.account', 'account')
    .leftJoinAndSelect('recipe.categoryMappings', 'categoryMappings')
    .leftJoinAndSelect('categoryMappings.recipeCategory', 'category');

    // Build query builder
    const queryBuilder = this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoin('recipe.viewHistories', 'viewHistory')
      .leftJoin('recipe.likes', 'recipeLike')
      .leftJoin('recipe.favorites', 'favoriteRecipe')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredient')
      .leftJoinAndSelect('recipeIngredient.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.categoryMappings', 'recipeCategoryMapping')
      .leftJoinAndSelect('recipeCategoryMapping.recipeCategory', 'category')
      .where('recipe.name LIKE :kw', { kw: `%${queryDto}%` })
      .orWhere('ingredient.name LIKE :kw', { kw: `%${queryDto}%` })
      .orWhere('category.name LIKE :kw', { kw: `%${queryDto}%` })
      .andWhere('recipe.status = :status', { status: 'public' })
      .select([
        'recipe.id',
        'recipe.name',
        'recipe.status',
        'recipe.imageUrl',
        'recipe.createdAt',
        'COUNT(DISTINCT viewHistory.id) as viewCount',
        'COUNT(DISTINCT CONCAT(recipeLike.accountId, "-", recipeLike.recipeId)) as likeCount',
        'COUNT(DISTINCT CONCAT(favoriteRecipe.accountId, "-", favoriteRecipe.recipeId)) as favoriteCount',
      ])

      .groupBy('recipe.id');

    // Add search conditions
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

    const [data, total] = await qb.skip(offset).take(limit).getManyAndCount();

    return {
      data,
      total,
    };
  }

  async searchRecipesFor(queryDto: SearchRecipeQueryDto) {
    const { query, status, offset = 0, limit = 10 } = queryDto;

    const qb = this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.account', 'account')
      .leftJoinAndSelect('recipe.categoryMappings', 'mapping')
      .leftJoinAndSelect('mapping.recipeCategory', 'category')
      .where('1=1');

    // Tìm theo tên món hoặc tên danh mục
    if (query) {
      qb.andWhere(
        new Brackets((qbWhere) => {
          qbWhere
            .where('LOWER(recipe.name) LIKE LOWER(:q)', { q: `%${query}%` })
            .orWhere('LOWER(category.name) LIKE LOWER(:q)', { q: `%${query}%` });
        })
      );
    }

    // Lọc theo trạng thái nếu có
    if (status) {
      qb.andWhere('recipe.status = :status', { status });
    }

    qb.orderBy('recipe.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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
      throw new BadRequestException(
        'Công thức phải có ít nhất một nguyên liệu',
      );
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
        throw new BadRequestException(
          'Mỗi nguyên liệu phải có đơn vị đo lường',
        );
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
      const categoryMappings = dto.categoryIds.map((categoryId) => ({
        recipeId: savedRecipe.id,
        recipeCategoryId: categoryId,
      }));
      await queryRunner.manager.save(RecipeCategoryMapping, categoryMappings);
      console.log('Saved category mappings:', categoryMappings);

      // 3. Lưu ingredients
      const ingredients = dto.ingredients.map((ing) => ({
        recipeId: savedRecipe.id,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unitId: ing.unitId,
      }));
      await queryRunner.manager.save(RecipeIngredient, ingredients);
      console.log('Saved ingredients:', ingredients);

      // 4. Lưu steps
      const steps = dto.steps.map((step) => ({
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
            recipeCategory: true,
          },
          recipeIngredients: {
            ingredient: true,
            unit: true,
          },
          cookingSteps: true,
        },
      });
      console.log('Recipe created successfully:', fullRecipe);
      return {
        message: 'Tạo công thức thành công',
        data: fullRecipe,
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
          name: error.name,
        });
      }

      throw new InternalServerErrorException(
        'Không thể tạo công thức: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
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
      throw new BadRequestException(
        'Công thức phải có ít nhất một nguyên liệu',
      );
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
        throw new BadRequestException(
          'Mỗi nguyên liệu phải có đơn vị đo lường',
        );
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
      relations: ['categoryMappings', 'recipeIngredients', 'cookingSteps'],
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
      await queryRunner.manager.delete(RecipeCategoryMapping, {
        recipeId: dto.id,
      });
      // Create new mappings
      const categoryMappings = dto.categoryIds.map((categoryId) => ({
        recipeId: updatedRecipe.id,
        recipeCategoryId: categoryId,
      }));
      await queryRunner.manager.save(RecipeCategoryMapping, categoryMappings);
      console.log('Updated category mappings:', categoryMappings);

      // 3. Update ingredients
      // Delete existing ingredients
      await queryRunner.manager.delete(RecipeIngredient, { recipeId: dto.id });
      // Create new ingredients
      const ingredients = dto.ingredients.map((ing) => ({
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
      const steps = dto.steps.map((step) => ({
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
            recipeCategory: true,
          },
          recipeIngredients: {
            ingredient: true,
            unit: true,
          },
          cookingSteps: true,
        },
      });
      console.log('Recipe updated successfully:', fullRecipe);
      return {
        message: 'Cập nhật công thức thành công',
        data: fullRecipe,
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Error updating recipe:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }

      throw new InternalServerErrorException(
        'Không thể cập nhật công thức: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findByIdWithStats(id: string) {
    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: [
        'account',
        'account.userProfile',
        'categoryMappings',
        'categoryMappings.recipeCategory',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'recipeIngredients.unit',
        'cookingSteps',
      ],
    });


    if (!recipe) {
      throw new NotFoundException(`Không tìm thấy công thức với id: ${id}`);
    }


    // Đếm like
    const totalLikes = await this.recipeLikeRepo.count({
      where: { recipe: { id } },
    });

    // Đếm favorites
    const totalFavorites = await this.favoriteRecipeRepo.count({
      where: { recipe: { id } },
    });

    // Đếm views
    const totalViews = await this.viewHistoryRepo.count({
      where: { recipe: { id } },
    });

    return {
      ...recipe,
      totalLikes,
      totalFavorites,
      totalViews,
    };
  }

  async getRecipeDetailForUser(
    id: string,
    accountId?: string,
    increaseView = true,
  ) {
    const recipe = await this.recipeRepo.findOne({
      where: {
        id,
        status: RecipeStatus.PUBLIC, // Chỉ lấy công thức công khai
      },
      relations: [
        'account',
        'account.userProfile',
        'categoryMappings',
        'categoryMappings.recipeCategory',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'recipeIngredients.unit',
        'cookingSteps',
      ],
    });

    if (!recipe) {
      throw new NotFoundException(`Không tìm thấy công thức với id: ${id}`);
    }

    // Đếm like
    // Đếm likes
    const totalLikes = await this.recipeLikeRepo.count({
      where: { recipe: { id } },
    });

    // Đếm favorites
    const totalFavorites = await this.favoriteRecipeRepo.count({
      where: { recipe: { id } },
    });

    // Đếm views
    const totalViews = await this.viewHistoryRepo.count({
      where: { recipe: { id } },
    });

    // Kiểm tra xem công thức có phải là favorite của người dùng hiện tại không
    let isFavorite = false;
    // Kiểm tra xem người dùng đã like công thức này chưa
    let isLiked = false;
    if (accountId) {
      // Kiểm tra favorite
      const favorite = await this.favoriteRecipeRepo.findOne({
        where: {
          recipe: { id },
        },
      });
      isFavorite = !!favorite;

      // Kiểm tra like
      const like = await this.recipeLikeRepo.findOne({
        where: {
          recipe: { id },
        },
      });
      isLiked = !!like;
    }

    // Tăng lượt xem cho tất cả người dùng
    if (increaseView) {
      await this.viewHistoryRepo.save({
        accountId: accountId || null,
        recipe: { id },
        viewedAt: new Date(),
      });
    }

    return {
      ...recipe,
      totalLikes,
      totalFavorites,
      totalViews,
      isFavorite,
      isLiked,
    };
  }

  async getRecipeById(id: string) {
    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: [
        'account',
        'categoryMappings',
        'categoryMappings.recipeCategory',
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'recipeIngredients.unit',
        'cookingSteps',
      ],
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
    return {
      message: 'Không có công thức nào phù hợp',
      data: [],
    };
  }
    return {
      message: 'Lấy công thức thành công',
      data: {
        id: recipe.id,
        imageUrl: recipe.imageUrl,
        description: recipe.description,
      },
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
      qb.leftJoin(
        'recipe.favorites',
        'userFavorite',
        'userFavorite.accountId = :accountId',
        { accountId },
      ).addSelect(
        'CASE WHEN userFavorite.accountId IS NOT NULL THEN true ELSE false END',
        'recipe_isFavorite',
      );
    }

    // Sử dụng subquery để tính điểm
    const scoreSubquery = this.recipeRepo
      .createQueryBuilder('r')
      .select(
        `
        COUNT(DISTINCT v.id) * 0.5 + 
        COUNT(DISTINCT CONCAT(l.accountId, l.recipeId)) * 2 + 
        COUNT(DISTINCT CONCAT(f.accountId, f.recipeId)) * 3
      `,
      )
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
      qb.leftJoin(
        'recipe.favorites',
        'userFavorite',
        'userFavorite.accountId = :accountId',
        { accountId },
      ).addSelect(
        'CASE WHEN userFavorite.accountId IS NOT NULL THEN true ELSE false END',
        'recipe_isFavorite',
      );
    }

    // Sử dụng subquery để tính điểm
    const scoreSubquery = this.recipeRepo
      .createQueryBuilder('r')
      .select(
        `
        COUNT(DISTINCT v.id) * 0.5 + 
        COUNT(DISTINCT CONCAT(l.accountId, l.recipeId)) * 2 + 
        COUNT(DISTINCT CONCAT(f.accountId, f.recipeId)) * 3
      `,
      )
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

  async getRecipeFeed(options?: {
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) {
    const sortBy = options?.sortBy || 'recommended';
    
    // Đảm bảo limit và offset là số
    let limit = 10;
    if (options?.limit !== undefined) {
      const parsedLimit = Number(options.limit);
      limit = !isNaN(parsedLimit) ? parsedLimit : 10;
    }
    
    let offset = 0;
    if (options?.offset !== undefined) {
      const parsedOffset = Number(options.offset);
      offset = !isNaN(parsedOffset) ? parsedOffset : 0;
    }
    
    // Tạo query builder cơ bản
    const qb = this.recipeRepo.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.account', 'account')
      .leftJoinAndSelect('account.userProfile', 'userProfile')
      .leftJoinAndSelect('recipe.categoryMappings', 'categoryMappings')
      .leftJoinAndSelect('categoryMappings.recipeCategory', 'category')
      .where('recipe.status = :status', { status: RecipeStatus.PUBLIC });
  
    // Tối đa 20 công thức
    const maxRecipes = 15;
    
    // Nếu offset >= maxRecipes, trả về mảng rỗng
    if (offset >= maxRecipes) {
      return {
        message: 'Lấy feed công thức thành công',
        data: [],
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: maxRecipes,
          hasMore: false
        }
      };
    }
    
    // Điều chỉnh limit nếu vượt quá maxRecipes
    if (offset + limit > maxRecipes) {
      limit = maxRecipes - offset;
    }
    
    // Áp dụng sắp xếp dựa trên tham số sortBy
    switch (sortBy) {
      case 'newest':
        // Lấy công thức mới nhất dựa trên ngày tạo
        qb.orderBy('recipe.createdAt', 'DESC');
        break;
        
      case 'views':
        // Sắp xếp theo lượt xem
        const viewsSubquery = this.viewHistoryRepo.createQueryBuilder('vh')
          .select('COUNT(vh.id)', 'viewCount')
          .where('vh.recipeId = recipe.id');
        
        qb.addSelect(`(${viewsSubquery.getQuery()})`, 'viewCount')
          .orderBy('viewCount', 'DESC');
        break;
        
      case 'likes':
        // Sắp xếp theo lượt thích
        const likesSubquery = this.recipeLikeRepo.createQueryBuilder('rl')
          .select('COUNT(DISTINCT CONCAT(rl.accountId, "-", rl.recipeId))', 'likeCount')
          .where('rl.recipeId = recipe.id');
        
        qb.addSelect(`(${likesSubquery.getQuery()})`, 'likeCount')
          .orderBy('likeCount', 'DESC');
        break;
        
      case 'favorites':
        // Sắp xếp theo lượt yêu thích
        const favoritesSubquery = this.favoriteRecipeRepo.createQueryBuilder('fr')
          .select('COUNT(DISTINCT CONCAT(fr.accountId, "-", fr.recipeId))', 'favoriteCount')
          .where('fr.recipeId = recipe.id');
        
        qb.addSelect(`(${favoritesSubquery.getQuery()})`, 'favoriteCount')
          .orderBy('favoriteCount', 'DESC');
        break;
        
      case 'recommended':
      default:
        // Sử dụng mảng scores để lưu các thành phần điểm
        qb.leftJoin('recipe.viewHistories', 'vh')
          .leftJoin('recipe.likes', 'l')
          .leftJoin('recipe.favorites', 'f')
          .addSelect('COUNT(DISTINCT vh.id)', 'view_count')
          .addSelect('COUNT(DISTINCT CONCAT(l.accountId, "-", l.recipeId))', 'like_count')
          .addSelect('COUNT(DISTINCT CONCAT(f.accountId, "-", f.recipeId))', 'favorite_count')
          // Thêm trường tính độ mới
          .addSelect(`CASE 
            WHEN recipe.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 5
            WHEN recipe.createdAt >= DATE_SUB(NOW(), INTERVAL 14 DAY) THEN 3
            ELSE 1 
          END`, 'recency')
          // Thêm yếu tố ngẫu nhiên
          .addSelect('RAND()', 'random_factor')
          // Thêm trường điểm tổng hợp
          .addSelect(`(
            CASE 
              WHEN recipe.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 5
              WHEN recipe.createdAt >= DATE_SUB(NOW(), INTERVAL 14 DAY) THEN 3
              ELSE 1 
            END + 
            (COUNT(DISTINCT vh.id) * 0.2) + 
            (COUNT(DISTINCT CONCAT(l.accountId, "-", l.recipeId)) * 0.8) + 
            COUNT(DISTINCT CONCAT(f.accountId, "-", f.recipeId)) + 
            RAND() * 2
          )`, 'total_score')
          .groupBy('recipe.id')
          .addGroupBy('account.id')
          .addGroupBy('userProfile.id')
          .addGroupBy('categoryMappings.recipe_id')
          .addGroupBy('categoryMappings.recipe_category_id')
          .addGroupBy('category.id')
          // Sắp xếp theo điểm tổng hợp đã tính
          .orderBy('total_score', 'DESC');
        break;
    }
    
    // Áp dụng phân trang
    qb.skip(offset).take(limit);
    
    // Thực hiện truy vấn
    const recipes = await qb.getRawAndEntities();
    
    // Kết hợp dữ liệu entities và thông tin bổ sung từ raw
    const result = recipes.entities.map((recipe, index) => {
      const raw = recipes.raw[index] || {};
      return {
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl,
        description: recipe.description ? 
          (recipe.description.length > 100 ? recipe.description.substring(0, 100) + '...' : recipe.description) : '',
        author: {
          id: recipe.account?.id || '',
          name: recipe.account?.userProfile?.fullName || recipe.account?.userProfile?.displayName || 'Người dùng ẩn danh',
          avatar: recipe.account?.userProfile?.avatarUrl || null
        },
        viewCount: raw.viewCount ? parseInt(raw.viewCount) : 0,
        likeCount: raw.likeCount ? parseInt(raw.likeCount) : 0,
        favoriteCount: raw.favoriteCount ? parseInt(raw.favoriteCount) : 0,
        createdAt: recipe.createdAt
      };
    });
    
    return {
      message: 'Lấy feed công thức thành công',
      data: result,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: Math.min(await qb.getCount(), maxRecipes),
        hasMore: offset + limit < maxRecipes
      }
    };
  }

  async searchRecipes_(keyword: string): Promise<Recipe[]> {
    return this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredient')
      .leftJoinAndSelect('recipeIngredient.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.categoryMappings', 'recipeCategoryMapping')
      .leftJoinAndSelect('recipeCategoryMapping.recipeCategory', 'category')
      .where('recipe.name LIKE :kw', { kw: `%${keyword}%` })
      .orWhere('ingredient.name LIKE :kw', { kw: `%${keyword}%` })
      .orWhere('category.name LIKE :kw', { kw: `%${keyword}%` })
      .andWhere('recipe.status = :status', { status: 'public' })
      .getMany();
  }

  async searchRecipesForAdmin(queryDto: SearchRecipeQueryDto) {
    const { query, status, offset = 0, limit = 10 } = queryDto;
  
    // Tạo query builder với các join cần thiết
    const qb = this.recipeRepo.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.account', 'account')
      .leftJoinAndSelect('recipe.categoryMappings', 'categoryMappings')
      .leftJoinAndSelect('categoryMappings.recipeCategory', 'category');
  
    // Áp dụng điều kiện tìm kiếm nếu có
    if (query) {
      qb.andWhere('LOWER(recipe.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      });
    }
  
    if (status) {
      qb.andWhere('recipe.status = :status', { status });
    }
  
    // Thêm GROUP BY để tránh duplicate
    qb.groupBy('recipe.id')
      .addGroupBy('account.id')
      .addGroupBy('categoryMappings.recipe_id')
      .addGroupBy('categoryMappings.recipe_category_id')
      .addGroupBy('category.id');
  
    const [recipes, total] = await qb
      .skip(offset)
      .take(limit)
      .getManyAndCount();
      
    // Nếu không có recipes, trả về kết quả trống
    if (recipes.length === 0) {
      return {
        data: [],
        total: 0,
      };
    }
    
    // Lấy tất cả recipeIds để thực hiện các truy vấn tổng hợp
    const recipeIds = recipes.map(recipe => recipe.id);
    
    // 1. Truy vấn tổng hợp để đếm likes cho tất cả công thức
    const likesQuery = this.recipeLikeRepo.createQueryBuilder('like')
      .select('like.recipeId', 'recipeId')
      .addSelect('COUNT(*)', 'count')
      .where('like.recipeId IN (:...recipeIds)', { recipeIds })
      .groupBy('like.recipeId');
      
    const likesResult = await likesQuery.getRawMany();
    
    // Tạo map từ recipeId đến số lượng likes
    const likesMap = new Map<string, number>();
    likesResult.forEach(item => {
      likesMap.set(item.recipeId, parseInt(item.count, 10));
    });
    
    // 2. Truy vấn tổng hợp để đếm favorites cho tất cả công thức
    const favoritesQuery = this.favoriteRecipeRepo.createQueryBuilder('favorite')
      .select('favorite.recipeId', 'recipeId')
      .addSelect('COUNT(*)', 'count')
      .where('favorite.recipeId IN (:...recipeIds)', { recipeIds })
      .groupBy('favorite.recipeId');
      
    const favoritesResult = await favoritesQuery.getRawMany();
    
    // Tạo map từ recipeId đến số lượng favorites
    const favoritesMap = new Map<string, number>();
    favoritesResult.forEach(item => {
      favoritesMap.set(item.recipeId, parseInt(item.count, 10));
    });
    
    // 3. Truy vấn tổng hợp để đếm views cho tất cả công thức
    const viewsQuery = this.viewHistoryRepo.createQueryBuilder('view')
      .select('view.recipeId', 'recipeId')
      .addSelect('COUNT(*)', 'count')
      .where('view.recipeId IN (:...recipeIds)', { recipeIds })
      .groupBy('view.recipeId');
      
    const viewsResult = await viewsQuery.getRawMany();
    
    // Tạo map từ recipeId đến số lượng views
    const viewsMap = new Map<string, number>();
    viewsResult.forEach(item => {
      viewsMap.set(item.recipeId, parseInt(item.count, 10));
    });
    
    // Thêm thông tin thống kê vào mỗi recipe
    const recipesWithStats = recipes.map(recipe => ({
      ...recipe,
      totalLikes: likesMap.get(recipe.id) || 0,
      totalFavorites: favoritesMap.get(recipe.id) || 0,
      totalViews: viewsMap.get(recipe.id) || 0,
    }));
  
    return {
      data: recipesWithStats,
      total,
    };
  }
}
