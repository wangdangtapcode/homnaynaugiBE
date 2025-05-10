
import { Recipe } from '../../recipe/entities/recipe.entities';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('cooking_steps') // Ánh xạ tới bảng 'cooking_steps'
@Unique(['recipeId', 'stepOrder']) // Định nghĩa ràng buộc UNIQUE KEY uk_cooking_steps_recipe_order
export class CookingStep {
  @PrimaryGeneratedColumn() // id INT AUTO_INCREMENT PRIMARY KEY
  id: number;

  @Column({ type: 'char', length: 36, nullable: false, name: 'recipe_id' })
  recipeId: string; // UUID của công thức

  @Column({
    type: 'int',
    nullable: false,
    name: 'step_order',
    comment: 'Order of the cooking step',
  })
  stepOrder: number; // Thứ tự của bước nấu

  @Column({ type: 'text', nullable: false, name: 'instruction' })
  instruction: string; // Hướng dẫn chi tiết cho bước nấu

  @Column({
    type: 'text',
    nullable: true,
    name: 'image_url',
    comment: 'Illustrative image for the step, can be NULL',
  })
  imageUrl: string | null; // URL hình ảnh minh họa, có thể null

  // --- Mối quan hệ ---

  @ManyToOne(() => Recipe, (recipe) => recipe.cookingSteps, {
    nullable: false, // Một bước nấu phải thuộc về một công thức
    onDelete: 'CASCADE', // Nếu công thức bị xóa, các bước nấu của nó cũng bị xóa
  })
  @JoinColumn({ name: 'recipe_id', referencedColumnName: 'id' })
  recipe: Recipe; // Đối tượng công thức mà bước này thuộc về
}