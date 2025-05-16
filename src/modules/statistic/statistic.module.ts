import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { Recipe } from '../recipe/entities/recipe.entities';
import { Account } from '../account/entities/account.entities';
import { ViewHistory } from '../view_history/entities/view_history.entities';
import { RecipeLike } from '../recipe_like/entities/recipe_like.entities';
import { FavoriteRecipe } from '../favorite_recipe/entities/favorite_recipe.entities';
@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, Account, ViewHistory, RecipeLike, FavoriteRecipe]),
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
