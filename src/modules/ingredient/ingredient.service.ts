import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, DataSource } from 'typeorm';
import { Ingredient } from './entities/ingredient.entities';
import { SearchIngredientQueryDto, CreateIngredientDto, UpdateIngredientDto } from './ingredient.dto';
import { IngredientResponseDto } from './ingredient.dto';
import { IngredientCategoryMapping } from '../ingredient_category_mapping/entities/ingredient_category_mapping.entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(IngredientCategoryMapping)
    private categoryMappingRepository: Repository<IngredientCategoryMapping>,
    private dataSource: DataSource,
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


  async getAllIngredients(): Promise<IngredientResponseDto[]> {
    const ingredients = await this.ingredientRepository.find();
    return ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      imageUrl: ingredient.imageUrl,
    }));
  }

  async findIngredientsByNames(names: string[]) {
    const queryBuilder = this.ingredientRepository.createQueryBuilder('ingredient');
    
    // Sử dụng LOWER để so sánh chữ thường
    const conditions = names.map((name, index) => {
      const paramName = `name${index}`;
      queryBuilder.orWhere(`LOWER(ingredient.name) LIKE :${paramName}`, { 
        [paramName]: `%${name.toLowerCase()}%` 
      });
    });

    const ingredients = await queryBuilder.getMany();

    return ingredients.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      imageUrl: ingredient.imageUrl
    }));
  }

  async getIngredientById(id: string, includeCategories: boolean = true): Promise<Ingredient> {
    const queryBuilder = this.ingredientRepository.createQueryBuilder('ingredient')
      .where('ingredient.id = :id', { id });
    
    if (includeCategories) {
      queryBuilder.leftJoinAndSelect('ingredient.categoryMappings', 'categoryMappings')
                 .leftJoinAndSelect('categoryMappings.ingredientCategory', 'ingredientCategory');
    }
    
    const ingredient = await queryBuilder.getOne();
    
    if (!ingredient) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu với id: ${id}`);
    }
    
    return ingredient;
  }

  async createIngredient(dto: CreateIngredientDto): Promise<Ingredient> {
    // Check if ingredient with same name exists
    const existingIngredient = await this.ingredientRepository.findOne({
      where: { name: dto.name }
    });

    if (existingIngredient) {
      throw new ConflictException(`Nguyên liệu với tên '${dto.name}' đã tồn tại`);
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create ingredient
      const ingredientId = uuidv4();
      const ingredient = queryRunner.manager.create(Ingredient, {
        id: ingredientId,
        name: dto.name,
        imageUrl: dto.imageUrl || null
      });
      
      await queryRunner.manager.save(Ingredient, ingredient);

      // Create category mappings
      if (dto.categoryIds && dto.categoryIds.length > 0) {
        const categoryMappings = dto.categoryIds.map(categoryId => ({
          ingredientId: ingredientId,
          ingredientCategoryId: categoryId
        }));
        
        await queryRunner.manager.save(IngredientCategoryMapping, categoryMappings);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Get the complete ingredient with categories
      return this.getIngredientById(ingredientId);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException(`Lỗi khi tạo nguyên liệu: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async updateIngredient(dto: UpdateIngredientDto): Promise<Ingredient> {
    // Check if ingredient exists
    const ingredient = await this.getIngredientById(dto.id, false);
    
    // Check if name is already used by another ingredient
    if (dto.name !== ingredient.name) {
      const existingIngredient = await this.ingredientRepository.findOne({
        where: { name: dto.name }
      });

      if (existingIngredient && existingIngredient.id !== dto.id) {
        throw new ConflictException(`Nguyên liệu với tên '${dto.name}' đã tồn tại`);
      }
    }
    
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update ingredient properties
      ingredient.name = dto.name;
      if (dto.imageUrl) {
        ingredient.imageUrl = dto.imageUrl;
      }
      
      await queryRunner.manager.save(Ingredient, ingredient);
      
      // Remove existing category mappings
      await queryRunner.manager.delete(IngredientCategoryMapping, {
        ingredientId: dto.id
      });

      // Create new category mappings
      if (dto.categoryIds && dto.categoryIds.length > 0) {
        const categoryMappings = dto.categoryIds.map(categoryId => ({
          ingredientId: dto.id,
          ingredientCategoryId: categoryId
        }));
        
        await queryRunner.manager.save(IngredientCategoryMapping, categoryMappings);
      }
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Return updated ingredient with categories
      return this.getIngredientById(dto.id);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException(`Lỗi khi cập nhật nguyên liệu: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteIngredient(id: string): Promise<boolean> {
    // Check if ingredient exists
    const ingredient = await this.getIngredientById(id, false);
    
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete category mappings first (to maintain referential integrity)
      await queryRunner.manager.delete(IngredientCategoryMapping, {
        ingredientId: id
      });
      
      // Delete the ingredient
      await queryRunner.manager.remove(ingredient);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      return true;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException(`Lỗi khi xóa nguyên liệu: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
