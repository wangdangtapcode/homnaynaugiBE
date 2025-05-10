import { Recipe } from '../../recipe/entities/recipe.entities'; 
import { RecipeCategory } from '../../recipe_categorie/entities/recipe_categorie.entities'; 
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'; 

@Entity('recipe_category_mappings') // Ánh xạ tới bảng 'recipe_category_mappings'
@Index('idx_recipe_category_mapping_recipe_id', ['recipeId'])
@Index('idx_recipe_category_mapping_category_id', ['recipeCategoryId'])
export class RecipeCategoryMapping {
  @PrimaryColumn({ type: 'char', length: 36, name: 'recipe_id' })
  recipeId: string;

  @PrimaryColumn({ type: 'int', name: 'recipe_category_id' })
  recipeCategoryId: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.categoryMappings, { 
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id', referencedColumnName: 'id' })
  recipe: Recipe;

  @ManyToOne(() => RecipeCategory, (category) => category.recipeMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_category_id', referencedColumnName: 'id' })
  recipeCategory: RecipeCategory;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}