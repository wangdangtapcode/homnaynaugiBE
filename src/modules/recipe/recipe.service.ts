import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recipe } from './entities/recipe.entities';
import { SearchRecipeQueryDto, CreateRecipeDto } from './recipe.dto';
import { RecipeCategoryMapping } from '../recipe_category_mapping/entities/recipe_category_mapping.entities';
import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
import { CookingStep } from '../cooking_step/entities/cooking_step.entities';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';
import { Express } from 'express';

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
    private dataSource: DataSource,
    private cloudinaryService: CloudinaryService,
  ) {}

  async searchRecipes(queryDto: SearchRecipeQueryDto) {
    const { query, status, offset = 0, limit = 10 } = queryDto;

    // Build query builder
    const queryBuilder = this.recipeRepo.createQueryBuilder('recipe')
      .leftJoin('recipe.viewHistories', 'viewHistory')
      .leftJoin('recipe.likes', 'recipeLike')
      .leftJoin('recipe.favorites', 'favoriteRecipe')
      .select([
        'recipe.id',
        'recipe.name',
        'recipe.status',
        'recipe.imageUrl',
        'recipe.createdAt',
        'COUNT(DISTINCT viewHistory.id) as viewCount',
        'COUNT(DISTINCT CONCAT(recipeLike.accountId, "-", recipeLike.recipeId)) as likeCount',
        'COUNT(DISTINCT CONCAT(favoriteRecipe.accountId, "-", favoriteRecipe.recipeId)) as favoriteCount'
      ])
      .groupBy('recipe.id');

    // Add search conditions
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
    const [recipes, total] = await queryBuilder.getManyAndCount();

    // Transform the response and ensure unique recipes
    const uniqueRecipes = new Map();
    recipes.forEach(recipe => {
      if (!uniqueRecipes.has(recipe.id)) {
        uniqueRecipes.set(recipe.id, {
          id: recipe.id,
          name: recipe.name,
          status: recipe.status,
          imageUrl: recipe.imageUrl,
          viewCount: Number(recipe['viewCount'] || 0),
          likeCount: Number(recipe['likeCount'] || 0),
          favoriteCount: Number(recipe['favoriteCount'] || 0),
          createdAt: recipe.createdAt,
        });
      }
    });

    return {
      data: Array.from(uniqueRecipes.values()),
      total,
      offset,
      limit,
    };
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const result = await this.recipeRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async createRecipe(dto: CreateRecipeDto, accountId: string) {
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

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tạo recipe
      const recipe = this.recipeRepo.create({
        ...dto,
        accountId,
        status: dto.status,
      });
      const savedRecipe = await queryRunner.manager.save(Recipe, recipe);

      // 2. Lưu categories
      const categoryMappings = dto.categoryIds.map(categoryId => ({
        recipeId: savedRecipe.id,
        recipeCategoryId: categoryId,
      }));
      await queryRunner.manager.save(RecipeCategoryMapping, categoryMappings);

      // 3. Lưu ingredients
      const ingredients = dto.ingredients.map(ing => ({
        recipeId: savedRecipe.id,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unitId: ing.unitId,
      }));
      await queryRunner.manager.save(RecipeIngredient, ingredients);

      // 4. Lưu steps
      const steps = dto.steps.map(step => ({
        recipeId: savedRecipe.id,
        stepOrder: step.stepOrder,
        instruction: step.instruction,
        imageUrl: step.imageUrl,
      }));
      await queryRunner.manager.save(CookingStep, steps);

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
      console.log("TAO THANH CONG RECIPE ",fullRecipe)
      return {
        message: 'Tạo công thức thành công',
        data: fullRecipe
      };

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Không thể tạo công thức');
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
