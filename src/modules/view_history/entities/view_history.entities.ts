

import { Account } from '../../account/entities/account.entities'; 
import { Recipe } from '../../recipe/entities/recipe.entities'; 
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('view_history') // Ánh xạ tới bảng 'view_history'
export class ViewHistory {
  @PrimaryGeneratedColumn() // id INT AUTO_INCREMENT PRIMARY KEY
  id: number;

  @Column({ type: 'char', length: 36, nullable: true, name: 'account_id' })
  accountId: string | null; // UUID của tài khoản, có thể null cho người xem ẩn danh

  @Column({ type: 'char', length: 36, nullable: false, name: 'recipe_id' })
  recipeId: string; // UUID của công thức đã xem

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'viewed_at',
  })
  viewedAt: Date; // Thời điểm xem công thức

  // --- Mối quan hệ ---

  @ManyToOne(() => Account,  (account) => account.viewHistories, { // Giả sử Account có 'viewHistories'
    nullable: true, // Cho phép accountId là null
    onDelete: 'SET NULL', // Nếu tài khoản bị xóa, account_id trong lịch sử xem sẽ là NULL
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account | null; // Đối tượng tài khoản, có thể null

  @ManyToOne(() => Recipe, (recipe) => recipe.viewHistories, { // Giả sử Recipe có 'viewHistories'
    nullable: false, // Một lượt xem phải thuộc về một công thức
    onDelete: 'CASCADE', // Nếu công thức bị xóa, lịch sử xem liên quan cũng bị xóa
  })
  @JoinColumn({ name: 'recipe_id', referencedColumnName: 'id' })
  recipe: Recipe; // Đối tượng công thức
}