import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountPantryItemController } from './account_pantry_item.controller';
import { AccountPantryItemService } from './account_pantry_item.service';
import { AccountPantryItem } from './entities/account_pantry_item.entities';
import { IngredientCategory } from '../ingredient_category/entities/ingredient_category.entities';
import { Ingredient } from '../ingredient/entities/ingredient.entities';
import { IngredientCategoryMapping } from '../ingredient_category_mapping/entities/ingredient_category_mapping.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountPantryItem,
      IngredientCategory,
      Ingredient,
      IngredientCategoryMapping
    ]),
  ],
  controllers: [AccountPantryItemController],
  providers: [AccountPantryItemService],
})
export class AccountPantryItemModule {}
