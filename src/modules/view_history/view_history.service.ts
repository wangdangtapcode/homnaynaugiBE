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
  ) {}

  // Tạo mới lịch sử xem
  async create(createDto: ViewHistoryDto): Promise<ViewHistory> {
    const viewHistory = this.viewHistoryRepository.create();

    // Nếu có accountId thì gán đối tượng Account (chỉ id)
    if (createDto.account_id) {
      viewHistory.account = { id: createDto.account_id } as Account;
    } else {
      viewHistory.account = null; // xem ẩn danh
    }

    // Luôn phải có recipe_id, gán đối tượng Recipe (chỉ id)
    viewHistory.recipe = { id: createDto.recipe_id } as Recipe;

    return this.viewHistoryRepository.save(viewHistory);
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
}
