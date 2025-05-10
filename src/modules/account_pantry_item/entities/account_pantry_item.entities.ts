
import { Account } from '../../account/entities/account.entities';
import { Ingredient } from '../../ingredient/entities/ingredient.entities';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('account_pantry_items')
export class AccountPantryItem {
  @PrimaryColumn({ type: 'char', length: 36, name: 'account_id' })
  accountId: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'ingredient_id' })
  ingredientId: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'added_at',
  })
  addedAt: Date;

  @ManyToOne(() => Account, (account) => account.pantryItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.accountPantryItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ingredient_id', referencedColumnName: 'id' })
  ingredient: Ingredient;
}