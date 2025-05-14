import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteRecipe } from './entities/favorite_recipe.entities';
import { FavoriteRecipeService } from './favorite_recipe.service';
import { FavoriteRecipeController } from './favorite_recipe.controller';
import { Account } from '../account/entities/account.entities';
import { Recipe } from '../recipe/entities/recipe.entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriteRecipe, Account, Recipe]),
    AuthModule,
  ],
  controllers: [FavoriteRecipeController],
  providers: [FavoriteRecipeService],
  exports: [FavoriteRecipeService],
})
export class FavoriteRecipeModule {} 