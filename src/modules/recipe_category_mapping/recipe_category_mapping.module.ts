// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { RecipeCategoryMapping } from './entities/recipe_category_mapping.entities';
// import { RecipeCategoryMappingService } from './recipe_category_mapping.service';
// import { RecipeCategoryMappingController } from './recipe_category_mapping.controller';
// import { Recipe } from '../recipe/entities/recipe.entities';
// import { AuthModule } from "../auth/auth.module";
// import { CloudinaryModule } from "src/config/cloudinary/cloudinary.module";
// import { Account } from "../account/entities/account.entities";


// @Module({
//   imports: [TypeOrmModule.forFeature([RecipeCategoryMapping, Recipe, Account]),AuthModule],
//   controllers: [RecipeCategoryMappingController],
//   providers: [RecipeCategoryMappingService],
//   exports: [RecipeCategoryMappingService],
// })
// export class RecipeCategoryMappingModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from '../recipe/entities/recipe.entities';
import { RecipeCategory } from '../recipe_categorie/entities/recipe_categorie.entities'; // ✅ đúng đường dẫn tới RecipeCategory

import { RecipeCategoryMappingService } from './recipe_category_mapping.service';
import { RecipeCategoryMappingController } from './recipe_category_mapping.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, RecipeCategory]), // ✅ đăng ký cả 2 repository
  ],
  providers: [RecipeCategoryMappingService],
  controllers: [RecipeCategoryMappingController],
})
export class RecipeCategoryMappingModule {}

