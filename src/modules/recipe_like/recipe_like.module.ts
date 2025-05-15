import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeLike } from './entities/recipe_like.entities';
import { Recipe } from '../recipe/entities/recipe.entities';
import { RecipeLikeController } from './recipe_like.controller';
import { RecipeLikeService } from './recipe_like.service';
import { AccountModule } from '../account/account.module';
import { AuthModule } from '../auth/auth.module';
import { Account } from '../account/entities/account.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipeLike, Recipe,Account]),
    AccountModule,
    AuthModule
  ],
  controllers: [RecipeLikeController],
  providers: [RecipeLikeService],
  exports: [RecipeLikeService]
})
export class RecipeLikeModule {}
