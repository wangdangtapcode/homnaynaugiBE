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
import { CloudinaryModule } from '../../config/cloudinary/cloudinary.module';
import { RecipeLike } from '../recipe_like/entities/recipe_like.entities';
import { ViewHistory } from '../view_history/entities/view_history.entities';
import { FavoriteRecipe } from '../favorite_recipe/entities/favorite_recipe.entities';
import { RecipeLikeModule } from '../recipe_like/recipe_like.module';
import { FavoriteRecipeModule } from '../favorite_recipe/favorite_recipe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      RecipeCategoryMapping,
      RecipeIngredient,
      CookingStep,
      Account,
      RecipeLike,
      ViewHistory,
      FavoriteRecipe
    ]),
    AuthModule,
    CloudinaryModule,
    RecipeLikeModule,
    FavoriteRecipeModule
  ],
  controllers: [RecipeController, AdminRecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}
