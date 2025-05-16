import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientCategory } from '../ingredient_category/entities/ingredient_category.entities';
import { IngredientCategoryMapping } from '../ingredient_category_mapping/entities/ingredient_category_mapping.entities';
import { Ingredient } from '../ingredient/entities/ingredient.entities';

@Injectable()
export class IngredientCategoryService {
  constructor(
    @InjectRepository(IngredientCategory)
    private categoryRepo: Repository<IngredientCategory>,

    @InjectRepository(IngredientCategoryMapping)
    private mappingRepo: Repository<IngredientCategoryMapping>,

    @InjectRepository(Ingredient)
    private ingredientRepo: Repository<Ingredient>,
  ) {}

  async getAllCategories() {
    return await this.categoryRepo.find();
  }

  async getIngredientsByCategory(categoryId: number) {
    const mappings = await this.mappingRepo.find({
      where: { ingredientCategoryId: categoryId },
      relations: ['ingredient'],
    });

    return mappings.map((m) => m.ingredient);
  }
}
