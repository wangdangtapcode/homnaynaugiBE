import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeLike } from './entities/recipe_like.entities';
import { Recipe } from '../recipe/entities/recipe.entities';
import { ToggleRecipeLikeDto } from './recipe_like.dto';

@Injectable()
export class RecipeLikeService {
  constructor(
    @InjectRepository(RecipeLike)
    private readonly recipeLikeRepo: Repository<RecipeLike>,
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
  ) {}

  async toggleLike(userId: string, dto: ToggleRecipeLikeDto) {
    const { recipeId } = dto;
    
    // Kiểm tra xem đã like chưa
    const existingLike = await this.recipeLikeRepo.findOne({
      where: {
        accountId: userId,
        recipeId: recipeId
      }
    });
    
    // Nếu đã like, thì xóa (unlike)
    if (existingLike) {
      await this.recipeLikeRepo.remove(existingLike);
      return { message: 'Đã bỏ thích công thức', isLiked: false };
    }
    
    // Nếu chưa like, thì thêm mới
    const newLike = this.recipeLikeRepo.create({
      accountId: userId,
      recipeId: recipeId
    });
    
    await this.recipeLikeRepo.save(newLike);
    return { message: 'Đã thích công thức', isLiked: true };
  }
}
