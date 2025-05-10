import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IngredientCategory } from './entities/ingredient_category.entities';
import { CreateIngredientCategoryDto } from './ingredient_category.dto';

@Injectable()
export class IngredientCategoryService {
  constructor(
    @InjectRepository(IngredientCategory)
    private readonly ingredientCategoryRepository: Repository<IngredientCategory>,
  ) {}

  async create(createDto: CreateIngredientCategoryDto): Promise<IngredientCategory> {
    // Check if category name already exists
    const existingCategory = await this.ingredientCategoryRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Tên danh mục đã tồn tại');
    }

    // Create new category
    const category = this.ingredientCategoryRepository.create(createDto);
    return this.ingredientCategoryRepository.save(category);
  }

  async findAll(query?: string, offset?: number, limit?: number) {
    const where = query ? { name: Like(`%${query}%`) } : {};
    
    const [data, total] = await this.ingredientCategoryRepository.findAndCount({
      where,
      skip: offset || 0,
      take: limit || 10,
      relations: ['ingredients'],
    });

    return { data, total };
  }

  async findOne(id: number): Promise<IngredientCategory> {
    const category = await this.ingredientCategoryRepository.findOne({
      where: { id },
      relations: ['ingredients'],
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async update(id: number, updateDto: CreateIngredientCategoryDto): Promise<IngredientCategory> {
    const category = await this.findOne(id);

    // Check if new name conflicts with existing category
    if (updateDto.name !== category.name) {
      const existingCategory = await this.ingredientCategoryRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Tên danh mục đã tồn tại');
      }
    }

    // Update category
    Object.assign(category, updateDto);
    return this.ingredientCategoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.ingredientCategoryRepository.remove(category);
  }
}
