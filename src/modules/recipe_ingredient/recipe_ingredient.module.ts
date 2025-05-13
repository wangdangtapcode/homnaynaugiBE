import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeIngredientController } from './recipe_ingredient.controller';
import { RecipeIngredientService } from './recipe_ingredient.service';
import { RecipeIngredient } from './entities/recipe_ingredient.entities';
import { Recipe } from '../recipe/entities/recipe.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipeIngredient, Recipe])
  ],
  controllers: [RecipeIngredientController],
  providers: [RecipeIngredientService],
  exports: [RecipeIngredientService]
})
export class RecipeIngredientModule {}
