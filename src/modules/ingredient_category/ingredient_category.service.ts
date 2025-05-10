import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(): Promise<IngredientCategory[]> {
    return this.ingredientCategoryRepository.find({
      relations: ['ingredients'],
    });
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
}
