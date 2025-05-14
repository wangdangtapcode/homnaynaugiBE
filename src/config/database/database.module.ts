import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Account } from '../../modules/account/entities/account.entities';
import { AccountRole } from '../../modules/account_role/entities/account_role.entities';
import { Role } from '../../modules/role/entities/role.entities';
import { UserProfile } from '../../modules/user_profile/entitie/user_profiles.entities';
import { Recipe } from '../../modules/recipe/entities/recipe.entities';
import { RecipeIngredient } from '../../modules/recipe_ingredient/entities/recipe_ingredient.entities';
import { Ingredient } from '../../modules/ingredient/entities/ingredient.entities';
import { UnitOfMeasure } from '../../modules/unit_of_measure/entities/unit_of_measure.entities';
import { RecipeCategory } from '../../modules/recipe_categorie/entities/recipe_categorie.entities';
import { IngredientCategory } from '../../modules/ingredient_category/entities/ingredient_category.entities';
import { CookingStep } from '../../modules/cooking_step/entities/cooking_step.entities';
import { RecipeLike } from '../../modules/recipe_like/entities/recipe_like.entities';
import { FavoriteRecipe } from '../../modules/favorite_recipe/entities/favorite_recipe.entities';
import { ViewHistory } from '../../modules/view_history/entities/view_history.entities';
import { AccountPantryItem } from '../../modules/account_pantry_item/entities/account_pantry_item.entities';
import { RecipeCategoryMapping } from 'src/modules/recipe_category_mapping/entities/recipe_category_mapping.entities';
import { IngredientCategoryMapping } from 'src/modules/ingredient_category_mapping/entities/ingredient_category_mapping.entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.getOrThrow('DB_HOST'),
          port: parseInt(config.getOrThrow('DB_PORT'), 10),
          username: config.getOrThrow('DB_USERNAME'),
          password: config.getOrThrow('DB_PASSWORD'),
          database: config.getOrThrow('DB_NAME'),
          entities: [
            Account,
            AccountRole,
            Role,
            UserProfile,
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
          ],
          synchronize: false,
          dropSchema: false,
          charset: 'utf8mb4',
          ssl: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
}) // lag vhaizzzz
export class DatabaseModule {}