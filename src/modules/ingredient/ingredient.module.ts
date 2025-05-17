import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entities';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { IngredientCategoryMapping } from '../ingredient_category_mapping/entities/ingredient_category_mapping.entities';
import { AuthModule } from '../auth/auth.module';
import { Account } from '../account/entities/account.entities';
import { AdminIngredientController } from './admin_ingredient.controller';
import { CloudinaryModule } from '../../config/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient, IngredientCategoryMapping, Account]),
    AuthModule,
    CloudinaryModule
  ],
  controllers: [IngredientController, AdminIngredientController],
  providers: [IngredientService],
  exports: [IngredientService],
})
export class IngredientModule {}
