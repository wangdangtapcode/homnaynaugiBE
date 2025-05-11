import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entities';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { IngredientCategoryMapping } from '../ingredient_category_mapping/entities/ingredient_category_mapping.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient, IngredientCategoryMapping]),
  ],
  controllers: [IngredientController],
  providers: [IngredientService],
  exports: [IngredientService],
})
export class IngredientModule {}
