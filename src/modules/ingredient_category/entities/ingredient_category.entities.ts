
import { IngredientCategoryMapping } from 'src/modules/ingredient_category_mapping/entities/ingredient_category_mapping.entities';
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

  @OneToMany(() => IngredientCategoryMapping, mapping => mapping.ingredientCategory)
  ingredientMappings: IngredientCategoryMapping[];
}