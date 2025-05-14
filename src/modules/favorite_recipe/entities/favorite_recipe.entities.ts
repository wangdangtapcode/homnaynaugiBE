import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { Account } from '../../account/entities/account.entities';
import { Recipe } from '../../recipe/entities/recipe.entities';

@Entity('favorite_recipes')
export class FavoriteRecipe {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, account => account.favorites, { onDelete: 'CASCADE' })
  account: Account;

  @ManyToOne(() => Recipe, recipe => recipe.favorites, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: true })
  is_active: boolean;
} 