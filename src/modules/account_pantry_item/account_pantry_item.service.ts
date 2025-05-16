import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AccountPantryItem } from './entities/account_pantry_item.entities';
import { CreateAccountPantryItemDto } from './account_pantry_item.dto';
import { IngredientCategory } from '../ingredient_category/entities/ingredient_category.entities';
import { Ingredient } from '../ingredient/entities/ingredient.entities';
import { IngredientCategoryMapping } from '../ingredient_category_mapping/entities/ingredient_category_mapping.entities';

@Injectable()
export class AccountPantryItemService {
  constructor(
    @InjectRepository(AccountPantryItem)
    private accountPantryItemRepository: Repository<AccountPantryItem>,
    @InjectRepository(IngredientCategory)
    private ingredientCategoryRepository: Repository<IngredientCategory>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(IngredientCategoryMapping)
    private ingredientCategoryMappingRepository: Repository<IngredientCategoryMapping>,
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
    // Lấy tất cả pantry items của user
    const pantryItems = await this.accountPantryItemRepository.find({
      where: { accountId: accountId },
      relations: ['ingredient'],
    });

    // Lấy tất cả category mappings cho các ingredients
    const ingredientIds = pantryItems.map(item => item.ingredientId);
    const categoryMappings = await this.ingredientCategoryMappingRepository.find({
      where: { ingredientId: In(ingredientIds) },
      relations: ['ingredientCategory'],
    });

    // Tạo map để dễ dàng tìm category cho mỗi ingredient
    const ingredientCategoryMap = new Map();
    categoryMappings.forEach(mapping => {
      ingredientCategoryMap.set(mapping.ingredientId, mapping.ingredientCategory);
    });

    // Nhóm các nguyên liệu theo category
    const categoryMap = new Map();
    
    for (const item of pantryItems) {
      const ingredient = item.ingredient;
      const category = ingredientCategoryMap.get(ingredient.id);
      
      if (!category) continue; // Bỏ qua nếu không tìm thấy category
      
      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          name: category.name,
          ingredients: []
        });
      }
      
      categoryMap.get(category.id).ingredients.push({
        id: ingredient.id,
        name: ingredient.name,
        image_url: ingredient.imageUrl
      });
    }

    // Chuyển đổi Map thành mảng
    return Array.from(categoryMap.values());
  }

  async removeIngredientFromPantry(accountId: string, ingredientId: string) {
    const pantryItem = await this.accountPantryItemRepository.findOne({
      where: {
        accountId: accountId,
        ingredientId: ingredientId
      }
    });

    if (!pantryItem) {
      throw new NotFoundException('Không tìm thấy nguyên liệu trong kho của bạn');
    }

    await this.accountPantryItemRepository.remove(pantryItem);

    return {
      message: 'Đã xóa nguyên liệu khỏi kho',
      removedIngredient: ingredientId
    };
  }

  async removeAllIngredientsFromPantry(accountId: string) {
    console.log('Bắt đầu xóa tất cả nguyên liệu cho account:', accountId);
    
    const pantryItems = await this.accountPantryItemRepository.find({
      where: { accountId: accountId }
    });

    console.log('Số lượng nguyên liệu tìm thấy:', pantryItems.length);

    if (!pantryItems || pantryItems.length === 0) {
      console.log('Không tìm thấy nguyên liệu nào để xóa');
      return {
        message: 'Kho của bạn đang trống',
        removedCount: 0
      };
    }

    try {
      // Xóa tất cả các bản ghi của account này
      await this.accountPantryItemRepository.delete({ accountId: accountId });
      
      console.log('Đã xóa thành công tất cả nguyên liệu');
      return {
        message: 'Đã xóa tất cả nguyên liệu khỏi kho',
        removedCount: pantryItems.length
      };
    } catch (error) {
      console.error('Lỗi khi xóa nguyên liệu:', error);
      throw error;
    }
  }
}
