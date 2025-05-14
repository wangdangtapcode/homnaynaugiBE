import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteRecipe } from './entities/favorite_recipe.entities';
import { Recipe } from '../recipe/entities/recipe.entities';
import { Account } from '../account/entities/account.entities';
import { FavoriteRecipeResponseDto } from './favorite_recipe.dto';

@Injectable()
export class FavoriteRecipeService {
  constructor(
    @InjectRepository(FavoriteRecipe)
    private favoriteRepo: Repository<FavoriteRecipe>,

    @InjectRepository(Recipe)
    private recipeRepo: Repository<Recipe>,

    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  async addToFavorites(accountId: string, recipeId: string): Promise<FavoriteRecipeResponseDto> {
    const recipe = await this.recipeRepo.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    const existing = await this.favoriteRepo.findOne({
      where: {
        account: { id: accountId },
        recipe: { id: recipeId },
      },
    });

    if (existing) {
      throw new BadRequestException('Công thức đã có trong danh sách yêu thích');
    }

    const favorite = this.favoriteRepo.create({
      account: { id: accountId },
      recipe: { id: recipeId },
    });

    try {
      const saved = await this.favoriteRepo.save(favorite);
      return {
        id: saved.id,
        recipe: {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          image_url: recipe.imageUrl,
          prep_time: recipe.preparationTimeMinutes,
        },
        created_at: saved.created_at,
        is_active: saved.is_active,
      };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new InternalServerErrorException('Không thể thêm vào danh sách yêu thích');
    }
  }

  async removeFromFavorites(accountId: string, recipeId: string): Promise<void> {
    const result = await this.favoriteRepo.delete({
      account: { id: accountId },
      recipe: { id: recipeId },
    });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('Không tìm thấy yêu thích để xóa');
    }
  }

  async getFavoriteRecipes(accountId: string, page: number = 1, limit: number = 10): Promise<{
    data: FavoriteRecipeResponseDto[];
    total: number;
  }> {
    const favorites = await this.favoriteRepo.find({
      where: { account: { id: accountId } },
      relations: ['recipe', 'recipe.categoryMappings', 'recipe.categoryMappings.recipeCategory'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data: FavoriteRecipeResponseDto[] = favorites.map((fav) => ({
      id: fav.id,
      recipe: {
        id: fav.recipe.id,
        name: fav.recipe.name,
        description: fav.recipe.description,
        image_url: fav.recipe.imageUrl,
        prep_time: fav.recipe.preparationTimeMinutes,
      },
      created_at: fav.created_at,
      is_active: fav.is_active,
    }));

    const total = await this.favoriteRepo.count({
      where: { account: { id: accountId } },
    });

    return { data, total };
  }
}
