// src/modules/user/entities/user-profile.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Account } from '../../account/entities/account.entities';
  
  @Entity('user_profiles') // Ánh xạ tới bảng 'user_profiles'
  export class UserProfile {
    @PrimaryGeneratedColumn({ comment: 'ID tự tăng của hồ sơ người dùng' })
    id: number;
  
    @Column({
      type: 'char',
      length: 36,
      unique: true, // Đảm bảo account_id là duy nhất, thể hiện quan hệ 1-1
      nullable: false,
      name: 'account_id',
      comment: 'UUID của tài khoản liên kết (khóa ngoại)',
    })
    accountId: string; // Lưu trữ ID của Account liên kết
  
    @Column({
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false,
      name: 'email',
      comment: 'Địa chỉ email duy nhất (dùng để liên lạc, thông báo)',
    })
    email: string;
  
    @Column({
      type: 'varchar',
      length: 50,
      nullable: true,
      name: 'phone_number',
    })
    phoneNumber: string | null;
  
    @Column({
      type: 'varchar',
      length: 255,
      nullable: true,
      name: 'display_name',
      comment: 'Tên hiển thị của người dùng',
    })
    displayName: string | null;
  
    @Column({
      type: 'text',
      nullable: true,
      name: 'avatar_url',
      comment: 'URL hoặc đường dẫn đến ảnh đại diện',
    })
    avatarUrl: string | null;
  
    @Column({
      type: 'varchar',
      length: 255,
      nullable: true,
      name: 'full_name',
      comment: 'Họ và tên đầy đủ',
    })
    fullName: string | null;
  
    @Column({
      type: 'text',
      nullable: true,
      name: 'address',
      comment: 'Địa chỉ',
    })
    address: string | null;
  
    @CreateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP(6)',
      name: 'created_at',
    })
    createdAt: Date;
  
    @UpdateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP(6)',
      onUpdate: 'CURRENT_TIMESTAMP(6)',
      name: 'updated_at',
    })
    updatedAt: Date;
  
    /**
     * Mối quan hệ One-to-One với Account.
     * Một UserProfile thuộc về một Account.
     * @JoinColumn chỉ định rằng bảng này (user_profiles) sở hữu khóa ngoại.
     */
    @OneToOne(() => Account, (account) => account.userProfile, {
      onDelete: 'CASCADE', // Nếu Account bị xóa, UserProfile cũng bị xóa
      onUpdate: 'CASCADE', // Nếu Account.id thay đổi, account_id ở đây cũng thay đổi
    })
    @JoinColumn({ name: 'account_id', referencedColumnName: 'id' }) // name: tên cột FK ở bảng này
                                                                   // referencedColumnName: tên cột PK ở bảng Account
    account: Account;
  }