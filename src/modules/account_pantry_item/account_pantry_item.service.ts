import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AccountPantryItem } from './entities/account_pantry_item.entities';
import { CreateAccountPantryItemDto } from './account_pantry_item.dto';

@Injectable()
export class AccountPantryItemService {
  constructor(
    @InjectRepository(AccountPantryItem)
    private accountPantryItemRepository: Repository<AccountPantryItem>,
  ) {}

  async addIngredientToPantry(accountId: string, createDto: CreateAccountPantryItemDto) {
    // Kiểm tra trùng lặp trong mảng đầu vào
    const uniqueIngredientIds = [...new Set(createDto.ingredientIds)];

    // Kiểm tra các nguyên liệu đã tồn tại trong kho
    const existingItems = await this.accountPantryItemRepository.find({
      where: {
        accountId: accountId,
        ingredientId: In(uniqueIngredientIds)
      }
    });

    // Lọc ra các ID nguyên liệu chưa tồn tại
    const existingIds = existingItems.map(item => item.ingredientId);
    const newIngredientIds = uniqueIngredientIds.filter(id => !existingIds.includes(id));

    if (newIngredientIds.length === 0) {
      return {
        message: 'Tất cả nguyên liệu đã có trong kho',
        addedIngredients: [],
        skippedIngredients: existingIds
      };
    }

    // Tạo và lưu các item mới
    const pantryItems = newIngredientIds.map(ingredientId => 
      this.accountPantryItemRepository.create({
        accountId,
        ingredientId
      })
    );

    const savedItems = await this.accountPantryItemRepository.save(pantryItems);

    return {
      message: 'Đã thêm nguyên liệu vào kho',
      addedIngredients: savedItems.map(item => item.ingredientId),
      skippedIngredients: existingIds
    };
  }

  async getAccountPantryItems(accountId: string) {
    return await this.accountPantryItemRepository.find({
      where: { accountId: accountId },
    });
  }
}
