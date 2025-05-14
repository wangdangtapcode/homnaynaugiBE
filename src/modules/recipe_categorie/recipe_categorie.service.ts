import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RecipeCategory } from "./entities/recipe_categorie.entities";
import { Like, Repository } from "typeorm";
import { CreateRecipeCategoryDto } from "./recipe_categorie.dto";


@Injectable()
export class RecipeCategoryService{
    constructor(
        @InjectRepository(RecipeCategory)
        private readonly recipeCategoryRepository:Repository<RecipeCategory>,
    ){}

    async create(createDto: CreateRecipeCategoryDto): Promise<RecipeCategory> {
        // Check if category name already exists
        const existingCategory = await this.recipeCategoryRepository.findOne({
          where: { name: createDto.name },
        });
    
        if (existingCategory) {
          throw new ConflictException('Tên danh mục đã tồn tại');
        }
    
        // Create new category
        const category = this.recipeCategoryRepository.create(createDto);
        return this.recipeCategoryRepository.save(category);
      }
    
      async findAll(query?: string, offset?: number, limit?: number) {
        const where = query ? { name: Like(`%${query}%`) } : {};
        
        const [data, total] = await this.recipeCategoryRepository.findAndCount({
          where,
          skip: offset || 0,
          take: limit || 10,
        });
    
        return { data, total };
      }
    
      async findOne(id: number): Promise<RecipeCategory> {
        const category = await this.recipeCategoryRepository.findOne({
          where: { id },
        });
    
        if (!category) {
          throw new NotFoundException('Không tìm thấy danh mục');
        }
    
        return category;
      }
    
      async update(id: number, updateDto: CreateRecipeCategoryDto): Promise<RecipeCategory> {
        const category = await this.findOne(id);
    
        // Check if new name conflicts with existing category
        if (updateDto.name !== category.name) {
          const existingCategory = await this.recipeCategoryRepository.findOne({
            where: { name: updateDto.name },
          });
    
          if (existingCategory) {
            throw new ConflictException('Tên danh mục đã tồn tại');
          }
        }
    
        // Update category
        Object.assign(category, updateDto);
        return this.recipeCategoryRepository.save(category);
      }
    
      async remove(id: number): Promise<void> {
        const category = await this.findOne(id);
        await this.recipeCategoryRepository.remove(category);
      }

      async getRandomCategories() {
        const categories = await this.recipeCategoryRepository
          .createQueryBuilder('category')
          .orderBy('RAND()')
          .take(6)
          .getMany();

        return categories;
      }

      async getAllCategories(): Promise<RecipeCategory[]> {
        return this.recipeCategoryRepository.find();
      }
}