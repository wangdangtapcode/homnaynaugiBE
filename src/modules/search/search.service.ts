// search/service/search.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  Recipe,
  Ingredient,
  IngredientCategory,
  IngredientCategoryMapping,
  RecipeCategory,
  RecipeCategoryMapping,
} from './entities/search.entities';
import { SearchRecipeQueryDto } from './search.dto';

@Injectable()
export class SearchService {
  constructor(
    // Inject các repository tương ứng với các entity
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,

    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,

    @InjectRepository(IngredientCategory)
    private readonly ingredientCategoryRepository: Repository<IngredientCategory>,

    @InjectRepository(IngredientCategoryMapping)
    private readonly ingredientCategoryMappingRepository: Repository<IngredientCategoryMapping>,

    @InjectRepository(RecipeCategory)
    private readonly recipeCategoryRepository: Repository<RecipeCategory>,

    @InjectRepository(RecipeCategoryMapping)
    private readonly recipeCategoryMappingRepository: Repository<RecipeCategoryMapping>,
  ) {}

  // API tìm kiếm công thức theo tên món ăn, nguyên liệu, hoặc danh mục
  async searchRecipes(queryDto: SearchRecipeQueryDto) {
    const { query, categoryId, ingredientIds } = queryDto;
    // Khởi tạo query builder cho bảng recipe và join các bảng liên quan
    const qb = this.recipeRepository.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.categoryMappings', 'rcm')
      .leftJoinAndSelect('rcm.recipeCategory', 'rc')
      .leftJoinAndSelect('recipe.recipeIngredients', 'ri')
      .leftJoinAndSelect('ri.ingredient', 'ing')
      .where('1=1');
    // Nếu có query -> tìm theo tên món ăn, nguyên liệu, hoặc danh mục
    if (query) {
      qb.andWhere(
        '(recipe.name LIKE :query OR ing.name LIKE :query OR rc.name LIKE :query)',
        { query: `%${query}%` }
      );
    }
    // Nếu có categoryId -> lọc theo danh mục món ăn
    if (categoryId) {
      qb.andWhere('rc.id = :categoryId', { categoryId });
    }
    // API tìm món ăn chứa các nguyên liệu được truyền vào
    if (ingredientIds) {
      const ids = ingredientIds.split(',').map(id => id.trim());
      qb.andWhere('ing.id IN (:...ids)', { ids });
    }

    qb.orderBy('recipe.createdAt', 'DESC');
    return await qb.getMany();
  }
  
  async getRecipesByIngredientIds(ids: string) {
    const idArr = ids.split(',').map(id => id.trim());

    const recipes = await this.recipeRepository.createQueryBuilder('recipe')
      .leftJoin('recipe.recipeIngredients', 'ri')
      .where('ri.ingredientId IN (:...idArr)', { idArr })
      .getMany();

    return recipes;
  }
  // API lấy danh sách món ăn phổ biến dựa theo số lượt xem
  async getPopularRecipes() {
    return await this.recipeRepository.createQueryBuilder('recipe')
      .leftJoin('recipe.viewHistories', 'vh')
      .select('recipe')
      .addSelect('COUNT(vh.id)', 'viewCount')
      .groupBy('recipe.id')
      .orderBy('viewCount', 'DESC')
      .limit(10)
      .getMany();
  }
  // API lấy toàn bộ nguyên liệu
  async getAllIngredients() {
    return await this.ingredientRepository.find({ order: { name: 'ASC' } });
  }
  // API lấy danh mục món ăn, có thể lọc theo loại (type) nếu truyền vào
  async getRecipeCategories(type?: string) {
    const where = type ? { name: Like(`%${type}%`) } : {};
    return await this.recipeCategoryRepository.find({ where });
  }

    async searchRecipes2({ query }: SearchRecipeQueryDto): Promise<Recipe[]> {
      if (!query) return [];
  
      const keyword = `%${query}%`;
  
      const recipes = await this.recipeRepository
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredient')
        .leftJoinAndSelect('recipeIngredient.ingredient', 'ingredient')
        .leftJoinAndSelect('recipe.categoryMappings', 'categoryMapping')
        .leftJoinAndSelect('categoryMapping.recipeCategory', 'category')
        .where('recipe.name LIKE :keyword', { keyword })
        .orWhere('ingredient.name LIKE :keyword', { keyword })
        .orWhere('category.name LIKE :keyword', { keyword })
        .andWhere('recipe.status = :status', { status: 'public' })
        .getMany();
  
      return recipes;
    }
}
