// search/entities/search.entities.ts
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('ingredient_categories')
export class IngredientCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @OneToMany(() => IngredientCategoryMapping, mapping => mapping.ingredientCategory)
  ingredientMappings: IngredientCategoryMapping[];
}

@Entity('ingredients')
export class Ingredient {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @OneToMany(() => IngredientCategoryMapping, mapping => mapping.ingredient)
  categoryMappings: IngredientCategoryMapping[];
}

@Entity('ingredient_category_mappings')
export class IngredientCategoryMapping {
  @PrimaryColumn({ type: 'char', length: 36 })
  ingredientId: string;

  @PrimaryColumn({ type: 'int' })
  ingredientCategoryId: number;

  @ManyToOne(() => Ingredient, ingredient => ingredient.categoryMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @ManyToOne(() => IngredientCategory, category => category.ingredientMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_category_id' })
  ingredientCategory: IngredientCategory;
}

@Entity('recipe_categories')
export class RecipeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @OneToMany(() => RecipeCategoryMapping, mapping => mapping.recipeCategory)
  recipeCategoryMappings: RecipeCategoryMapping[];
}

@Entity('recipes')
export class Recipe {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36, nullable: true })
  accountId: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  protein: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fat: number | null;

  @Column({ type: 'int', nullable: true })
  calories: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carbohydrates: number | null;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @Column({ type: 'int', nullable: true, name: 'preparation_time_minutes' })
  preparationTimeMinutes: number | null;

  @Column({ type: 'text', nullable: true, name: 'video_url' })
  videoUrl: string | null;

  @Column({
    type: 'enum',
    enum: ['published', 'pending_approval', 'rejected', 'draft'],
    default: 'draft',
  })
  status: 'published' | 'pending_approval' | 'rejected' | 'draft';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at'
  })
  updatedAt: Date;

  @OneToMany(() => RecipeCategoryMapping, mapping => mapping.recipe)
  categoryMappings: RecipeCategoryMapping[];
}

@Entity('recipe_category_mappings')
export class RecipeCategoryMapping {
  @PrimaryColumn({ type: 'char', length: 36 })
  recipeId: string;

  @PrimaryColumn({ type: 'int' })
  recipeCategoryId: number;

  @ManyToOne(() => Recipe, recipe => recipe.categoryMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @ManyToOne(() => RecipeCategory, category => category.recipeCategoryMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_category_id' })
  recipeCategory: RecipeCategory;
}
