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

@Entity('view_history')
export class ViewHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.viewHistories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account | null;

  @ManyToOne(() => Recipe, (recipe) => recipe.viewHistories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @CreateDateColumn({ type: 'timestamp', name: 'viewed_at', default: () => 'CURRENT_TIMESTAMP(6)' })
  viewedAt: Date;

  @JoinColumn({ name: 'created_by' }) // tên cột foreign key trong DB
  createdBy: Account;
}