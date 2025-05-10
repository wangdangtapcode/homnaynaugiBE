import { Recipe } from '../../recipe/entities/recipe.entities';
import { Ingredient } from '../../ingredient/entities/ingredient.entities';
import { UnitOfMeasure } from '../../unit_of_measure/entities/unit_of_measure.entities'; 
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('recipe_ingredients') // Ánh xạ tới bảng 'recipe_ingredients'
export class RecipeIngredient {
  // Khóa chính kết hợp (Composite Primary Key)
  @PrimaryColumn({ type: 'char', length: 36, name: 'recipe_id' })
  recipeId: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'ingredient_id' })
  ingredientId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'quantity',
  })
  quantity: number | null; // Số lượng

  @Column({ type: 'int', nullable: true, name: 'unit_id' })
  unitId: number | null; // ID của đơn vị đo lường

  // --- Mối quan hệ ---

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id', referencedColumnName: 'id' })
  recipe: Recipe;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ingredient_id', referencedColumnName: 'id' })
  ingredient: Ingredient;

  @ManyToOne(() => UnitOfMeasure, (unit) => unit.recipeIngredients, { // Giả sử UnitOfMeasure có 'recipeIngredients'
    nullable: true,
    onDelete: 'RESTRICT', // Hoặc 'SET NULL' tùy theo định nghĩa CSDL của bạn
  })
  @JoinColumn({ name: 'unit_id', referencedColumnName: 'id' })
  unit: UnitOfMeasure | null; // Đối tượng đơn vị đo lường, có thể null
}