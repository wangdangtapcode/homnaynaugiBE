import { Account } from '../../account/entities/account.entities'; 
import { RecipeCategory } from '../../recipe_categorie/entities/recipe_categorie.entities'; 
import { RecipeIngredient } from '../../recipe_ingredient/entities/recipe_ingredient.entities'; 
import { CookingStep } from '../../cooking_step/entities/cooking_step.entities';
import { RecipeLike } from '../../recipe_like/entities/recipe_like.entities'; 
import { FavoriteRecipe } from '../../favorite_recipe/entities/favorite_recipe.entities'; 
import { ViewHistory } from '../../view_history/entities/view_history.entities'; 
import {
  Entity,
  Column,
  PrimaryColumn, // Vì id là CHAR(36)
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RecipeCategoryMapping } from 'src/modules/recipe_category_mapping/entities/recipe_category_mapping.entities';

export enum RecipeStatus {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected',
  DRAFT = 'draft',
}

@Entity('recipes') // Ánh xạ tới bảng 'recipes'
export class Recipe {
  @PrimaryColumn({
    type: 'char',
    length: 36,
    comment: 'UUID của công thức, được tạo bởi ứng dụng',
  })
  id: string; // UUID, bạn sẽ cần tự tạo giá trị này ở tầng service

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'name',
  })
  name: string; // Tên công thức

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'protein' })
  protein: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'fat' })
  fat: number | null;

  @Column({ type: 'int', nullable: true, name: 'calories' })
  calories: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'carbohydrates' })
  carbohydrates: number | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'image_url',
    comment: 'URL hoặc đường dẫn đến ảnh công thức',
  })
  imageUrl: string | null;

  @Column({
    type: 'int',
    nullable: true,
    name: 'preparation_time_minutes',
    comment: 'Thời gian hoàn thành công thức (ví dụ: tính bằng phút)',
  })
  preparationTimeMinutes: number | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'video_url',
    comment: 'URL video hướng dẫn',
  })
  videoUrl: string | null;

  @Column({
    type: 'enum',
    enum: RecipeStatus,
    default: RecipeStatus.DRAFT,
    nullable: false,
    name: 'status',
    comment: 'Trạng thái của công thức',
  })
  status: RecipeStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    name: 'updated_at',
  })
  updatedAt: Date;

  // --- Mối quan hệ ---

  @Column({ type: 'char', length: 36, nullable: false, name: 'account_id' })
  accountId: string; // UUID của người tạo

  @Column({ type: 'char', length: 36, nullable: true, name: 'updated_by' })
  updatedBy: string | null; // UUID của người cập nhật gần nhất

  @ManyToOne(() => Account, (account) => account.recipes, { // Giả sử Account có thuộc tính 'recipes'
    nullable: false,
    onDelete: 'CASCADE', // Nếu tài khoản bị xóa, account_id của công thức sẽ là NULL
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account; // Đối tượng người tạo, có thể null

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedByAccount: Account; // Đối tượng người cập nhật gần nhất


  @OneToMany(() => RecipeCategoryMapping, (mapping) => mapping.recipe)
  categoryMappings: RecipeCategoryMapping[];
  /**
   * Mối quan hệ One-to-Many với RecipeIngredient (bảng trung gian).
   * Một công thức có nhiều nguyên liệu.
   */
  @OneToMany(() => RecipeIngredient, (recipeIngredient) => recipeIngredient.recipe)
  recipeIngredients: RecipeIngredient[];

  /**
   * Mối quan hệ One-to-Many với CookingStep.
   * Một công thức có nhiều bước nấu.
   */
  @OneToMany(() => CookingStep, (cookingStep) => cookingStep.recipe)
  cookingSteps: CookingStep[];

  /**
   * Mối quan hệ One-to-Many với RecipeLike.
   * Một công thức có thể được nhiều người dùng thích.
   */
  @OneToMany(() => RecipeLike, (like) => like.recipe)
  likes: RecipeLike[];

  /**
   * Mối quan hệ One-to-Many với FavoriteRecipe.
   * Một công thức có thể được nhiều người dùng lưu vào yêu thích.
   */
  @OneToMany(() => FavoriteRecipe, (favorite) => favorite.recipe)
  favorites: FavoriteRecipe[];

   /**
   * Mối quan hệ One-to-Many với ViewHistory.
   * Một công thức có thể được xem nhiều lần.
   */
  @OneToMany(() => ViewHistory, (view) => view.recipe)
  viewHistories: ViewHistory[];
}