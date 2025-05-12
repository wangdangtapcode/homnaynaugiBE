import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Ingredient } from './entities/ingredient.entities';
import { SearchIngredientQueryDto } from './ingredient.dto';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  async searchIngredients(queryDto: SearchIngredientQueryDto) {
    const { query, categoryIds, offset = 0, limit = 10 } = queryDto;

    // Build query builder
    const queryBuilder = this.ingredientRepository.createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.categoryMappings', 'categoryMappings')
      .leftJoinAndSelect('categoryMappings.ingredientCategory', 'ingredientCategory');

    // Add search by name condition
    if (query) {
      queryBuilder.andWhere('ingredient.name LIKE :query', { query: `%${query}%` });
    }

    // Add category filter condition
    if (categoryIds) {
      const categoryIdArray = categoryIds.split(',').map(Number);
      queryBuilder.andWhere('categoryMappings.ingredientCategoryId IN (:...categoryIds)', { categoryIds: categoryIdArray });
    }

    // Add pagination and ordering
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('ingredient.name', 'ASC');

    // Execute query
    const [ingredients, total] = await queryBuilder.getManyAndCount();

    // Transform the response
    const transformedIngredients = ingredients.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      imageUrl: ingredient.imageUrl,
      categories: ingredient.categoryMappings.map(mapping => ({
        id: mapping.ingredientCategory.id,
        name: mapping.ingredientCategory.name,
        imageUrl: mapping.ingredientCategory.imageUrl,
      })),
    }));

    return {
      data: transformedIngredients,
      total,
      offset,
      limit,
    };
  }

  async getRandomIngredients(limit = 6) {
    const results = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .orderBy('RAND()') // PostgreSQL dùng RANDOM()
      .limit(limit)
      .getMany();

    return {
      data: results,
      total: results.length,
    };
  }
}
