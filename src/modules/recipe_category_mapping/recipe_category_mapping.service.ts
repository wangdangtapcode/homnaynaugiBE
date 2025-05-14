import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Recipe } from '../recipe/entities/recipe.entities';
import { RecipeCategory } from '../recipe_categorie/entities/recipe_categorie.entities';
import { GetRecipesByCategoryDto } from './recipe_category_mapping.dto';

@Injectable()
export class RecipeCategoryMappingService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,

    @InjectRepository(RecipeCategory)
    private readonly categoryRepo: Repository<RecipeCategory>,
  ) {}

  async getRecipesByCategoryNameMatch(categoryId: number) {
    // B1: Tìm danh mục theo ID
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${categoryId}`);
    }

    // B2: Lấy tên danh mục để tìm trong tên món ăn
    const keyword = category.name;

    // B3: Tìm tất cả món ăn có tên chứa keyword (không phân biệt hoa thường)
    const recipes = await this.recipeRepo.find({
      where: {
        name: ILike(`%${keyword}%`), // tìm theo tên có chứa tên danh mục
      },
      order: {
        name: 'ASC',
      },
    });

    // B4: Trả kết quả
    return {
      message: `Tìm thấy ${recipes.length} món ăn chứa từ "${keyword}"`,
      data: recipes,
      total: recipes.length,
    };
  }

  async searchRecipes(dto: GetRecipesByCategoryDto) {
    const { query } = dto;

    const recipes = await this.recipeRepo.find({
      where: {
        name: ILike(`%${query}%`),
      },
      order: {
        name: 'ASC',
      },
    });

    return {
      message: `Tìm thấy ${recipes.length} món ăn chứa từ "${query}"`,
      data: recipes,
      total: recipes.length,
    };
  }
}
