import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteRecipe } from './entities/favorite_recipe.entities';
import { Recipe } from '../recipe/entities/recipe.entities';
import { ToggleFavoriteRecipeDto } from './favorite_recipe.dto';

@Injectable()
export class FavoriteRecipeService {
  constructor(
    @InjectRepository(FavoriteRecipe)
    private readonly favoriteRecipeRepo: Repository<FavoriteRecipe>,
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
  ) {}

  async toggleFavorite(accountId: string, dto: ToggleFavoriteRecipeDto) {
      //Kiểm tra đã lưu chưa
      const existingFavorite = await this.favoriteRecipeRepo.findOne({
        where: {
          accountId,
          recipeId: dto.recipeId
        }
      });

      //Nếu đã lưu thì xóa
      if (existingFavorite) {
        await this.favoriteRecipeRepo.remove(existingFavorite);
        return { message: 'Đã xóa công thức khỏi danh sách yêu thích', isFavorite: false };
      }
      
      //Nếu chưa lưu thì thêm
      const newFavorite = this.favoriteRecipeRepo.create({
        accountId,
        recipeId: dto.recipeId
      });
      
      await this.favoriteRecipeRepo.save(newFavorite);
      return { message: 'Đã thêm công thức vào danh sách yêu thích', isFavorite: true };
      
      
    }
  
}
