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
    // Kiểm tra xem công thức có tồn tại không
    const recipe = await this.recipeRepo.findOne({
      where: { id: dto.recipeId }
    });

    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    // Kiểm tra xem đã yêu thích chưa
    const existingFavorite = await this.favoriteRecipeRepo.findOne({
      where: {
        accountId,
        recipeId: dto.recipeId
      }
    });

    if (existingFavorite) {
      // Nếu đã yêu thích thì xóa
      await this.favoriteRecipeRepo.remove(existingFavorite);
      return {
        message: 'Đã xóa khỏi danh sách yêu thích',
        isFavorite: false
      };
    } else {
      // Nếu chưa yêu thích thì thêm mới
      const favorite = this.favoriteRecipeRepo.create({
        accountId,
        recipeId: dto.recipeId
      });
      await this.favoriteRecipeRepo.save(favorite);
      return {
        message: 'Đã thêm vào danh sách yêu thích',
        isFavorite: true
      };
    }
  }
}
