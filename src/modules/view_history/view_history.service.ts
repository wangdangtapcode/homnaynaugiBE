import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewHistory } from './entities/view_history.entities';
import { ViewHistoryDto } from './view_history.dto';
import { Account } from '../account/entities/account.entities';
import { Recipe } from '../recipe/entities/recipe.entities';

@Injectable()
export class ViewHistoryService {
  constructor(
    @InjectRepository(ViewHistory)
    private readonly viewHistoryRepository: Repository<ViewHistory>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  // Tạo mới lịch sử xem
  async createOrUpdate(createDto: ViewHistoryDto): Promise<ViewHistory> {
  // Tìm lịch sử xem theo recipe_id (bỏ qua account_id)
    const existing = await this.viewHistoryRepository.findOne({
      where: {
        recipe: { id: createDto.recipe_id },
        // account: createDto.account_id ? { id: createDto.account_id } : null, // comment nếu không cần tìm theo account
      },
    });

    if (existing) {
      existing.viewedAt = new Date();
      return this.viewHistoryRepository.save(existing);
    } else {
      const viewHistory = this.viewHistoryRepository.create();

      if (createDto.account_id) {
        viewHistory.account = { id: createDto.account_id } as Account;
      } else {
        viewHistory.account = null;
      }

      viewHistory.recipe = { id: createDto.recipe_id } as Recipe;

      return this.viewHistoryRepository.save(viewHistory);
    }
  }


  // Lấy lịch sử xem theo accountId
  async findByAccountId(accountId: string): Promise<ViewHistory[]> {
    return this.viewHistoryRepository.find({
      where: { account: { id: accountId } },
      relations: ['recipe'],
      order: { viewedAt: 'DESC' },
    });
  }

  // Lấy tất cả lịch sử xem (có join account và recipe)
  async findAll(): Promise<ViewHistory[]> {
    return this.viewHistoryRepository.find({
      relations: ['account', 'recipe'],
      order: { viewedAt: 'DESC' },
    });
  }

  async findRecipesCreatedBy(accountId: string): Promise<Recipe[]> {
    return this.recipeRepository.find({
      where: {
        // Replace 'createdBy' with the actual property name in Recipe entity, e.g., 'account' or 'author'
        // For example, if the property is 'account':
        account: { id: accountId },
      },
      relations: ['account'], // add this if you want to join the account relation
      order: { createdAt: 'DESC' },
    });
  }


}