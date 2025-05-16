import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './config/database/database.module';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { Account } from './modules/account/entities/account.entities';
import { AccountModule } from './modules/account/account.module';
import { AccountRoleModule } from './modules/account_role/account_role.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserProfileModule } from './modules/user_profile/user_profile.module';
import { RoleModule } from './modules/role/role.module';
import { Recipe } from './modules/recipe/entities/recipe.entities';
import { RecipeIngredient } from './modules/recipe_ingredient/entities/recipe_ingredient.entities';
import { Ingredient } from './modules/ingredient/entities/ingredient.entities';
import { UnitOfMeasure } from './modules/unit_of_measure/entities/unit_of_measure.entities';
import { RecipeCategory } from './modules/recipe_categorie/entities/recipe_categorie.entities';
import { IngredientCategory } from './modules/ingredient_category/entities/ingredient_category.entities';
import { CookingStep } from './modules/cooking_step/entities/cooking_step.entities';
import { RecipeLike } from './modules/recipe_like/entities/recipe_like.entities';
import { FavoriteRecipe } from './modules/favorite_recipe/entities/favorite_recipe.entities';
import { ViewHistory } from './modules/view_history/entities/view_history.entities';
import { AccountPantryItem } from './modules/account_pantry_item/entities/account_pantry_item.entities';
import { IngredientCategoryModule } from './modules/ingredient_category/ingredient_category.module';
import { RecipeCategoryModule } from './modules/recipe_categorie/recipe_categorie.module';
import { RecipeCategoryMapping } from './modules/recipe_category_mapping/entities/recipe_category_mapping.entities';
import { IngredientCategoryMapping } from './modules/ingredient_category_mapping/entities/ingredient_category_mapping.entities';
import { IngredientModule } from './modules/ingredient/ingredient.module';
import { AiModule } from './modules/ai/ai.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { UnitOfMeasureModule } from './modules/unit_of_measure/unit_of_measure.module';
import { FavoriteRecipeModule } from './modules/favorite_recipe/favorite_recipe.module';
import { RecipeLikeModule } from './modules/recipe_like/recipe_like.module';
import { RecipeIngredientModule } from './modules/recipe_ingredient/recipe_ingredient.module';
import { SearchModule } from './modules/search/search.module';
import { AccountPantryItemModule } from './modules/account_pantry_item/account_pantry_item.module';
import {RecipeCategoryMappingModule} from './modules/recipe_category_mapping/recipe_category_mapping.module';
import { StatisticModule } from './modules/statistic/statistic.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: Number(configService.get<number>('REDIS_PORT')),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Account,
      Recipe,
      RecipeIngredient,
      Ingredient,
      UnitOfMeasure,
      RecipeCategory,
      IngredientCategory,
      CookingStep,
      RecipeLike,
      FavoriteRecipe,
      ViewHistory,
      AccountPantryItem,
      RecipeCategoryMapping,
      IngredientCategoryMapping
    ]),
    DatabaseModule,
    AccountModule,
    AccountRoleModule,
    AuthModule,
    UserProfileModule,
    RoleModule,
    IngredientCategoryModule,
    RecipeCategoryModule,
    IngredientModule,
    RecipeModule,
    UnitOfMeasureModule,
    AiModule,
    FavoriteRecipeModule,
    RecipeLikeModule,
    SearchModule,
    RecipeIngredientModule,
    AccountPantryItemModule,
    RecipeCategoryMappingModule,
    StatisticModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    Reflector,
  ],
})
export class AppModule {}