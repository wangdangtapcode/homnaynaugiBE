import { Ingredient } from '../../ingredient/entities/ingredient.entities';
import { IngredientCategory } from '../../ingredient_category/entities/ingredient_category.entities';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('ingredient_category_mappings')
@Index('idx_ingredient_category_mapping_ingredient_id', ['ingredientId'])
@Index('idx_ingredient_category_mapping_category_id', ['ingredientCategoryId'])
export class IngredientCategoryMapping {
  @PrimaryColumn({ type: 'char', length: 36, name: 'ingredient_id' })
  ingredientId: string;

  @PrimaryColumn({ type: 'int', name: 'ingredient_category_id' })
  ingredientCategoryId: number;

  @ManyToOne(() => Ingredient, ingredient => ingredient.categoryMappings, {  onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id', referencedColumnName: 'id' })
  ingredient: Ingredient;

  @ManyToOne(() => IngredientCategory, category => category.ingredientMappings, {  onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_category_id', referencedColumnName: 'id' })
  ingredientCategory: IngredientCategory;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Bạn có thể thêm các cột khác ở đây nếu cần, ví dụ:
  // @CreateDateColumn()
  // assignedAt: Date;
}