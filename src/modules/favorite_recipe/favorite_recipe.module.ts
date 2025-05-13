import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteRecipe } from './entities/favorite_recipe.entities';
import { Recipe } from '../recipe/entities/recipe.entities';
import { FavoriteRecipeController } from './favorite_recipe.controller';
import { FavoriteRecipeService } from './favorite_recipe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriteRecipe, Recipe])
  ],
  controllers: [FavoriteRecipeController],
  providers: [FavoriteRecipeService],
  exports: [FavoriteRecipeService]
})
export class FavoriteRecipeModule {}
