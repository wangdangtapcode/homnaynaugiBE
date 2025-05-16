import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientCategory } from '../ingredient_category/entities/ingredient_category.entities';
import { IngredientCategoryController } from './ingredient_category_mapping.controller';
import { IngredientCategoryService } from './ingredient_category_mapping.service';
import { IngredientCategoryMapping } from '../ingredient_category_mapping/entities/ingredient_category_mapping.entities';
import { Ingredient } from '../ingredient/entities/ingredient.entities';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../../config/cloudinary/cloudinary.module';
import { Account } from '../account/entities/account.entities';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      IngredientCategory,
      IngredientCategoryMapping,
      Ingredient, Account
    ]), CloudinaryModule,
    AuthModule
  ],
  controllers: [IngredientCategoryController],
  providers: [IngredientCategoryService],
  exports: [IngredientCategoryService],
})
export class IngredientCategoryModule {}
