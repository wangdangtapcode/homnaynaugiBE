
import { Account } from '../../account/entities/account.entities';
import { Recipe } from '../../recipe/entities/recipe.entities';  
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('recipe_likes') // Ánh xạ tới bảng 'recipe_likes'
export class RecipeLike {
  // Khóa chính kết hợp
  @PrimaryColumn({ type: 'char', length: 36, name: 'account_id' })
  accountId: string; // UUID của tài khoản

  @PrimaryColumn({ type: 'char', length: 36, name: 'recipe_id' })
  recipeId: string; // UUID của công thức

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)', // Độ chính xác cao hơn cho timestamp
    name: 'liked_at',
  })
  likedAt: Date; // Thời điểm thích công thức

  // --- Mối quan hệ ---

  @ManyToOne(() => Account, (account) => account.likes, { // Giả sử Account có thuộc tính 'likes'
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;

  @ManyToOne(() => Recipe, (recipe) => recipe.likes, { // Giả sử Recipe có thuộc tính 'likes'
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id', referencedColumnName: 'id' })
  recipe: Recipe;
}