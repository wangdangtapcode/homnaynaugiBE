import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

import {
  // Recipe,
  Ingredient,
  IngredientCategory,
  IngredientCategoryMapping,
  RecipeCategory,
  RecipeCategoryMapping,
} from './entities/search.entities';

import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
import { CookingStep } from '../cooking_step/entities/cooking_step.entities';
import { AuthModule } from '../auth/auth.module';
import { Account } from '../account/entities/account.entities';
import { CloudinaryModule } from "src/config/cloudinary/cloudinary.module";

import { Recipe } from '../recipe/entities/recipe.entities';
// import { Ingredient } from '../../ingredient/entities/ingredient.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      Ingredient,
      IngredientCategory,
      IngredientCategoryMapping,
      RecipeCategory,
      RecipeCategoryMapping,
      RecipeIngredient,
      Account
    ]),AuthModule, CloudinaryModule
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}

