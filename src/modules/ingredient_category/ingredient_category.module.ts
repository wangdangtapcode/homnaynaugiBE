import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientCategory } from './entities/ingredient_category.entities';
import { IngredientCategoryService } from './ingredient_category.service';
import { IngredientCategoryController } from './ingredient_category.controller';
import { CloudinaryModule } from '../../config/cloudinary/cloudinary.module';
import { Account } from '../account/entities/account.entities';
import { AuthModule } from '../auth/auth.module';
import { AdminIngredientCategoryController } from './admin_ingredient_category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngredientCategory, Account]),
    CloudinaryModule,
    AuthModule
  ],
  controllers: [IngredientCategoryController, AdminIngredientCategoryController],
  providers: [IngredientCategoryService],
  exports: [IngredientCategoryService],
})
export class IngredientCategoryModule {}
