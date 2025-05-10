// src/modules/unit-of-measure/entities/unit-of-measure.entity.ts
// (Giả sử vị trí file)

// Import RecipeIngredient nếu bạn muốn định nghĩa mối quan hệ từ phía này (không bắt buộc ở đây)
// import { RecipeIngredient } from 'src/modules/recipe-ingredient/entities/recipe-ingredient.entity';
// import { UserPantryItem } from 'src/modules/user-pantry-item/entities/user-pantry-item.entity'; // Nếu có bảng này
import { RecipeIngredient } from 'src/modules/recipe_ingredient/entities/recipe_ingredient.entities';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('units_of_measure') // Ánh xạ tới bảng 'units_of_measure'
export class UnitOfMeasure {
  @PrimaryGeneratedColumn() // id INT AUTO_INCREMENT PRIMARY KEY
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
    name: 'unit_name',
    comment: 'e.g., Gram, Milliliter, Piece, Tablespoon',
  })
  unitName: string; // Tên đơn vị đo lường

  @Column({
    type: 'varchar',
    length: 20,
    unique: true, // Ký hiệu cũng là duy nhất
    nullable: true, // Cho phép null nếu không có ký hiệu
    name: 'symbol',
    comment: 'e.g., g, ml, pcs, tbsp',
  })
  symbol: string | null; // Ký hiệu đơn vị, có thể null

  /**
   * Mối quan hệ One-to-Many với RecipeIngredient.
   * Một đơn vị đo lường có thể được sử dụng trong nhiều bản ghi RecipeIngredient.
   * Bạn sẽ cần một thuộc tính 'unit' trong RecipeIngredient entity với @ManyToOne.
   */
  @OneToMany(() => RecipeIngredient, (recipeIngredient) => recipeIngredient.unit)
  recipeIngredients: RecipeIngredient[];

}