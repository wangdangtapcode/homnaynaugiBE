
import { Account } from '../../account/entities/account.entities'; 
import { Recipe } from '../../recipe/entities/recipe.entities';  
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('favorite_recipes') // Ánh xạ tới bảng 'favorite_recipes'
export class FavoriteRecipe {
  // Khóa chính kết hợp
  @PrimaryColumn({ type: 'char', length: 36, name: 'account_id' })
  accountId: string; // UUID của tài khoản

  @PrimaryColumn({ type: 'char', length: 36, name: 'recipe_id' })
  recipeId: string; // UUID của công thức

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'saved_at',
  })
  savedAt: Date; // Thời điểm lưu công thức vào yêu thích

  // --- Mối quan hệ ---

  @ManyToOne(() => Account, (account) => account.favorites,  { // Giả sử Account có thuộc tính 'favorites'
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;

  @ManyToOne(() => Recipe, (recipe) => recipe.favorites, { // Giả sử Recipe có thuộc tính 'favorites'

    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id', referencedColumnName: 'id' })
  recipe: Recipe;
}