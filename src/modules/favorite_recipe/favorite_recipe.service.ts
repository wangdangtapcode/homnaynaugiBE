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
import {
  AddFavoriteRecipeDto,
  RemoveFavoriteRecipeDto,
  ToggleFavoriteRecipeDto,
} from './favorite_recipe.dto';

@Injectable()
export class FavoriteRecipeService {
  constructor(
    @InjectRepository(FavoriteRecipe)
    private readonly favoriteRecipeRepo: Repository<FavoriteRecipe>,

    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  // Thêm công thức vào yêu thích
  async addToFavorites(accountId: string, dto: AddFavoriteRecipeDto): Promise<ToggleFavoriteRecipeDto> {
    const recipe = await this.recipeRepo.findOne({ where: { id: dto.recipeId } });
    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    const existing = await this.favoriteRecipeRepo.findOne({
      where: {
        account,
        recipe: { id: dto.recipeId },
      },
    });

    if (existing) {
      throw new BadRequestException('Công thức đã có trong danh sách yêu thích');
    }

    const favorite = this.favoriteRecipeRepo.create({ account, recipe });

    try {
      const saved = await this.favoriteRecipeRepo.save(favorite);
      return {
        recipeId: recipe.id,
      };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new InternalServerErrorException('Không thể thêm vào danh sách yêu thích');
    }
  }

  // Xóa công thức khỏi yêu thích
  async removeFromFavorites(accountId: string, dto: RemoveFavoriteRecipeDto): Promise<void> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    const result = await this.favoriteRecipeRepo.delete({
      account,
      recipe: { id: dto.recipeId },
    });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('Không tìm thấy yêu thích để xóa');
    }
  }

  // Thêm hoặc xóa công thức khỏi danh sách yêu thích (toggle)
  async toggleFavorite(accountId: string, dto: ToggleFavoriteRecipeDto): Promise<{
    message: string;
    isFavorite: boolean;
  }> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    const existingFavorite = await this.favoriteRecipeRepo.findOne({
      where: {
        account,
        recipe: { id: dto.recipeId },
      },
    });

    if (existingFavorite) {
      await this.favoriteRecipeRepo.remove(existingFavorite);
      return {
        message: 'Đã xóa công thức khỏi danh sách yêu thích',
        isFavorite: false,
      };
    }

    const recipe = await this.recipeRepo.findOne({ where: { id: dto.recipeId } });
    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    const newFavorite = this.favoriteRecipeRepo.create({ account, recipe });
    const saved = await this.favoriteRecipeRepo.save(newFavorite);

    return {
      message: 'Đã thêm công thức vào danh sách yêu thích',
      isFavorite: true,
    };
  }

  // Lấy danh sách công thức yêu thích
  async getFavoriteRecipes(accountId: string, page: number = 1, limit: number = 10): Promise<{
    data: ToggleFavoriteRecipeDto[];
    total: number;
  }> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    const favorites = await this.favoriteRecipeRepo.find({
      where: { account: { id: accountId }  },
      relations: ['recipe'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data: ToggleFavoriteRecipeDto[] = favorites.map((fav) => ({
      recipeId: fav.recipe.id,
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

    const total = await this.favoriteRecipeRepo.count({ where: { account } });

    return { data, total };
  }
}
