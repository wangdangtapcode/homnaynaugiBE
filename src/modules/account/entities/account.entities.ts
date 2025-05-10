// src/modules/account/entities/account.entity.ts

import {
    Entity,
    Column,
    PrimaryColumn, // Sử dụng PrimaryColumn vì ID là CHAR(36) và không tự tăng
    OneToMany,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Timestamp, // Có thể cần nếu bạn muốn định nghĩa kiểu cụ thể cho last_login_at
  } from 'typeorm';
  import { AccountRole } from '../../account_role/entities/account_role.entities'; 
  import { UserProfile } from '../../user_profile/entitie/user_profiles.entities'; 
  import { Recipe } from '../../recipe/entities/recipe.entities';
  import { RecipeLike } from '../../recipe_like/entities/recipe_like.entities';
  import { FavoriteRecipe } from '../../favorite_recipe/entities/favorite_recipe.entities';
  import { ViewHistory } from '../../view_history/entities/view_history.entities';
  import { AccountPantryItem } from '../../account_pantry_item/entities/account_pantry_item.entities';


  export enum AccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned',
  }
  
  @Entity('accounts') // Ánh xạ tới bảng 'accounts'
  export class Account {
    @PrimaryColumn({
      type: 'char',
      length: 36,
    })
    id: string; // UUID
  
    @Column({
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false,
      name: 'username', 
      comment: 'Tên đăng nhập duy nhất (có thể là email hoặc username riêng)',
    })
    username: string;
  
    @Column({
      type: 'varchar',
      length: 255,
      nullable: false,
      name: 'password_hash',
      comment: 'Mật khẩu đã được mã hóa',
      select: true, // Quan trọng: không tự động trả về trường này khi truy vấn SELECT
    })
    password: string; // Đổi tên thành 'password' trong entity cho ngắn gọn, nhưng map tới 'password_hash'
  
    @Column({
      type: 'enum',
      enum: AccountStatus,
      default: AccountStatus.ACTIVE,
      nullable: false,
      name: 'status',
      comment: 'Trạng thái của tài khoản',
    })
    status: AccountStatus;
  
    @Column({
      type: 'timestamp', // Hoặc 'datetime' tùy theo CSDL và driver
      nullable: true,
      name: 'last_login_at',
      comment: 'Thời điểm đăng nhập cuối cùng',
    })
    lastLoginAt: Date | null; // Sử dụng Date | null vì cột này có thể NULL
  
    @CreateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP(6)', // Độ chính xác cao hơn cho timestamp
      name: 'created_at',
    })
    createdAt: Date;
  
    @UpdateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP(6)',
      onUpdate: 'CURRENT_TIMESTAMP(6)', // Tự động cập nhật khi bản ghi thay đổi
      name: 'updated_at',
    })
    updatedAt: Date;
  
    /**
     * Mối quan hệ One-to-Many với AccountRole.
     * Một tài khoản (Account) có thể có nhiều vai trò (AccountRole).
     */
    @OneToMany(() => AccountRole, (accountRole) => accountRole.account)
    accountRoles: AccountRole[];
  
    /**
     * Mối quan hệ One-to-One với UserProfile.
     * Một tài khoản (Account) liên kết với một hồ sơ người dùng (UserProfile).
     */
    @OneToOne(() => UserProfile, (userProfile) => userProfile.account)
    userProfile: UserProfile;
  
    @OneToMany(() => Recipe, (recipe) => recipe.account)
    recipes: Recipe[];

    @OneToMany(() => RecipeLike, (like) => like.account)
    likes: RecipeLike[];

    @OneToMany(() => FavoriteRecipe, (favorite) => favorite.account)
    favorites: FavoriteRecipe[];

    @OneToMany(() => ViewHistory, (view) => view.account)
    viewHistories: ViewHistory[];

    @OneToMany(() => AccountPantryItem, (pantryItem) => pantryItem.account)
    pantryItems: AccountPantryItem[];
  }