import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entities';
import { RecipeController } from './recipe.controller';
import { AdminRecipeController } from './admin_recipe.controller';
import { RecipeService } from './recipe.service';
import { RecipeCategoryMapping } from '../recipe_category_mapping/entities/recipe_category_mapping.entities';
import { RecipeIngredient } from '../recipe_ingredient/entities/recipe_ingredient.entities';
import { CookingStep } from '../cooking_step/entities/cooking_step.entities';
import { Account } from '../account/entities/account.entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      RecipeCategoryMapping,
      RecipeIngredient,
      CookingStep,
      Account
    ]),
    AuthModule
  ],
  controllers: [RecipeController, AdminRecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}
