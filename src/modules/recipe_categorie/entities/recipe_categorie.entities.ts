
import { RecipeCategoryMapping } from 'src/modules/recipe_category_mapping/entities/recipe_category_mapping.entities';
import { Recipe } from '../../recipe/entities/recipe.entities'; 
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('recipe_categories') // Ánh xạ tới bảng 'recipe_categories' trong cơ sở dữ liệu
export class RecipeCategory {
  @PrimaryGeneratedColumn() // Định nghĩa cột 'id' là khóa chính tự tăng (INT AUTO_INCREMENT)
  id: number;

  @Column({
    type: 'varchar', // Kiểu dữ liệu VARCHAR
    length: 255,     // Độ dài tối đa 255 ký tự
    unique: true,    // Giá trị trong cột này phải là duy nhất
    nullable: false, // Không cho phép giá trị NULL
    name: 'name',    // Tên cột trong cơ sở dữ liệu
  })
  name: string; // Thuộc tính để lưu tên của danh mục công thức

  @Column({
    type: 'text',      // Kiểu dữ liệu TEXT (cho phép chuỗi dài)
    nullable: true,    // Cho phép giá trị NULL
    name: 'image_url', // Tên cột trong cơ sở dữ liệu
    comment: 'URL or path to the category image', // Chú thích cho cột
  })
  imageUrl: string | null; // Thuộc tính để lưu URL hình ảnh, có thể là null

  @OneToMany(() => RecipeCategoryMapping, (mapping) => mapping.recipeCategory)
  recipeMappings: RecipeCategoryMapping[];
}