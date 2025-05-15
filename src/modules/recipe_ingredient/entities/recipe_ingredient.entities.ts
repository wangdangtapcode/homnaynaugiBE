import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Recipe } from '../../recipe/entities/recipe.entities';
import { Ingredient } from '../../ingredient/entities/ingredient.entities';
import { UnitOfMeasure } from '../../unit_of_measure/entities/unit_of_measure.entities';

@Entity('recipe_ingredients')
export class RecipeIngredient {
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
  quantity: number | null;

  @Column({ type: 'int', nullable: true, name: 'unit_id' })
  unitId: number | null;

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

  @ManyToOne(() => UnitOfMeasure, (unit) => unit.recipeIngredients, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'unit_id', referencedColumnName: 'id' })
  unit: UnitOfMeasure | null;
}