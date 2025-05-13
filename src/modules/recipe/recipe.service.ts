import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entities';
import { SearchRecipeQueryDto, CreateRecipeDto } from './recipe.dto';
import { RecipeCategoryMapping } from '../recipe_category_mapping/entities/recipe_category_mapping.entities';
import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
import { CookingStep } from '../cooking_step/entities/cooking_step.entities';

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

  async createRecipe(dto: CreateRecipeDto) {

    // 1. Tạo recipe
    const recipe = this.recipeRepo.create({
      ...dto,
      status: dto.status,
    });
    await this.recipeRepo.save(recipe);

    // 2. Lưu categories
    for (const categoryId of dto.categoryIds) {
      await this.categoryMappingRepo.save({
        recipeId: recipe.id,
        recipeCategoryId: categoryId,
      });
    }

    // 3. Lưu ingredients
    for (const ing of dto.ingredients) {
      await this.ingredientRepo.save({
        recipeId: recipe.id,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unitId: ing.unitId,
      });
    }

    // 4. Lưu steps
    for (const step of dto.steps) {
      await this.stepRepo.save({
        recipeId: recipe.id,
        stepOrder: step.stepOrder,
        instruction: step.instruction,
        imageUrl: step.imageUrl,
      });
    }

    return { message: 'Recipe created', id: recipe.id };
  }
}
