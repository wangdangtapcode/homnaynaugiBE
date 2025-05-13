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
      .where('ingredient.id IN (:...ingredientIds)', {
        ingredientIds: ingredients.map(i => i.id)
      })
      .andWhere('recipe.status = :status', { status: 'public' });

    const recipes = await queryBuilder.getMany();

    // Tính toán % match và kiểm tra số lượng cho mỗi công thức
    const recipesWithMatch = await Promise.all(
      recipes.map(async (recipe) => {
        // Đếm số nguyên liệu khớp và kiểm tra số lượng
        const matchedIngredients = recipe.recipeIngredients.filter(ri => {
          const searchIngredient = ingredients.find(i => i.id === ri.ingredientId);
          if (!searchIngredient || !ri.quantity || !ri.unitId) return false;

          // Kiểm tra đơn vị đo
          if (ri.unitId !== searchIngredient.unit) return false;

          // Kiểm tra số lượng: số lượng người dùng có phải >= 70% số lượng công thức yêu cầu
          return searchIngredient.quantity >= ri.quantity * 0.7;
        });

        // Tính % match dựa trên số lượng nguyên liệu khớp
        const matchPercentage = (matchedIngredients.length / ingredients.length) * 100;

        // Chỉ trả về công thức có ít nhất 80% match
        if (matchPercentage < 80) return null;

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          imageUrl: recipe.imageUrl,
          preparationTimeMinutes: recipe.preparationTimeMinutes,
          matchPercentage: Math.round(matchPercentage),
          matchedIngredients: matchedIngredients.length,
          totalIngredients: recipe.recipeIngredients.length,
          ingredients: recipe.recipeIngredients.map(ri => ({
            id: ri.ingredient.id,
            name: ri.ingredient.name,
            quantity: ri.quantity || 0,
            unit: ri.unit?.unitName || 'N/A',
            isMatched: matchedIngredients.some(mi => mi.ingredientId === ri.ingredientId)
          }))
        };
      })
    );

    // Lọc bỏ các công thức không đủ điều kiện và sắp xếp theo % match
    const filteredRecipes = recipesWithMatch
      .filter(recipe => recipe !== null)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    return {
      data: filteredRecipes,
      total: filteredRecipes.length
    };
  }
}
