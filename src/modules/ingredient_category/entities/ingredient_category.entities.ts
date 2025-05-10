
import { Ingredient } from '../../ingredient/entities/ingredient.entities'; 
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('ingredient_categories') // Ánh xạ tới bảng 'ingredient_categories'
export class IngredientCategory {
  @PrimaryGeneratedColumn() // id INT AUTO_INCREMENT PRIMARY KEY
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
    name: 'name',
  })
  name: string; // Tên danh mục nguyên liệu

  @Column({
    type: 'text',
    nullable: true,
    name: 'image_url',
    comment: 'URL or path to the category image',
  })
  imageUrl: string | null; // URL hình ảnh, có thể null

  /**
   * Mối quan hệ One-to-Many với thực thể Ingredient.
   * Một danh mục nguyên liệu (IngredientCategory) có thể chứa nhiều nguyên liệu (Ingredient).
   */
  @OneToMany(() => Ingredient, (ingredient) => ingredient.category)
  ingredients: Ingredient[]; // Mảng các nguyên liệu thuộc danh mục này
}