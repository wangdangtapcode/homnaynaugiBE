import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientCategory } from './entities/ingredient_category.entities';
import { IngredientCategoryService } from './ingredient_category.service';
import { IngredientCategoryController } from './ingredient_category.controller';
import { CloudinaryModule } from '../../config/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngredientCategory]),
    CloudinaryModule,
  ],
  controllers: [IngredientCategoryController],
  providers: [IngredientCategoryService],
  exports: [IngredientCategoryService],
})
export class IngredientCategoryModule {}
