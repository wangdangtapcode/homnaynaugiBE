import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeIngredient } from './entities/recipe_ingredient.entities';
import { Recipe } from '../recipe/entities/recipe.entities';
import { FindRecipesByIngredientsDto } from './recipe_ingredient.dto';

@Injectable()
export class RecipeIngredientService {
  constructor(
    @InjectRepository(RecipeIngredient)
    private recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
  ) {}

  async findRecipesByIngredients(dto: FindRecipesByIngredientsDto) {
    const { ingredients } = dto;

    // Tìm các công thức có chứa ít nhất một trong các nguyên liệu được chọn
    const queryBuilder = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredient')
      .leftJoinAndSelect('recipeIngredient.ingredient', 'ingredient')
      .leftJoinAndSelect('recipeIngredient.unit', 'unit')
      .leftJoinAndSelect('recipe.account', 'account')
      .leftJoinAndSelect('account.userProfile', 'userProfile')
      .where('ingredient.id IN (:...ingredientIds)', {
        ingredientIds: ingredients.map(i => i.id)
      })
      .andWhere('recipe.status = :status', { status: 'public' });

    const recipes = await queryBuilder.getMany();

    // Tính toán % match cho mỗi công thức
    const recipesWithMatch = recipes.map(recipe => {
      // Đếm số nguyên liệu khớp
      const matchedIngredients = recipe.recipeIngredients.filter(ri =>
        ingredients.some(i => i.id === ri.ingredientId)
      );

      return {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        imageUrl: recipe.imageUrl,
        preparationTimeMinutes: recipe.preparationTimeMinutes,
        account: {
          username: recipe.account?.username,
          userProfile: {
            fullName: recipe.account?.userProfile?.fullName || 'Ẩn danh',
            avatarUrl: recipe.account?.userProfile?.avatarUrl || 'https://via.placeholder.com/150'
          }
        },
        ingredients: recipe.recipeIngredients.map(ri => ({
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          quantity: ri.quantity || 0,
          unit: ri.unit?.unitName || 'N/A',
          isMatched: matchedIngredients.some(mi => mi.ingredientId === ri.ingredientId)
        }))
      };
    });

    // Sắp xếp theo % match giảm dần
    const sortedRecipes = recipesWithMatch.sort((a, b) => {
      const matchedA = a.ingredients.filter(i => i.isMatched).length;
      const matchedB = b.ingredients.filter(i => i.isMatched).length;
      return matchedB - matchedA;
    });
    
    return {
      data: sortedRecipes,
      total: sortedRecipes.length
    };
  }
}
