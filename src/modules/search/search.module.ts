// // search/module/search.module.ts
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { SearchController } from './search.controller';
// import { SearchService } from './search.service';
// import { Recipe, Ingredient, IngredientCategory, IngredientCategoryMapping, RecipeCategory, RecipeCategoryMapping} from './entities/search.entities';


// // @Module({
// //   imports: [
// //     TypeOrmModule.forFeature([
// //       Recipe,
// //       Ingredient,
// //       IngredientCategory,
// //       IngredientCategoryMapping,
// //       RecipeCategory,
// //       RecipeCategoryMapping,
// //     ]),
// //   ],
// //   controllers: [SearchController],
// //   providers: [SearchService],
// //   exports: [SearchService],
// // })

// import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
// import { CookingStep } from '../cooking_step/entities/cooking_step.entities';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       Recipe,
//       Ingredient,
//       IngredientCategory,
//       IngredientCategoryMapping,
//       RecipeCategory,
//       RecipeCategoryMapping,
//       RecipeIngredient,
//       CookingStep,
//     ]),
//   ],
//   controllers: [SearchController],
//   providers: [SearchService],
// })
// export class SearchModule {}

// search/module/search.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from "src/config/cloudinary/cloudinary.module";
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

import {
  Recipe,
  Ingredient,
  IngredientCategory,
  IngredientCategoryMapping,
  RecipeCategory,
  RecipeCategoryMapping,
} from './entities/search.entities';

import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
import { CookingStep } from '../cooking_step/entities/cooking_step.entities';

// import { Recipe } from '../../recipe/entities/recipe.entities';
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
      // RecipeIngredient,
      // CookingStep,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}

