// src/modules/account-role/entities/account-role.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn, // Sử dụng CreateDateColumn cho assigned_at
  } from 'typeorm';
  import { Account } from '../../account/entities/account.entities'; 
  import { Role } from '../../role/entities/role.entities';        
  
  @Entity('account_roles') 
  export class AccountRole {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({
      type: 'char',
      length: 36,
      nullable: false,
      name: 'account_id',
      comment: 'UUID của tài khoản (khóa ngoại)',
    })
    accountId: string;
  
    @Column({
      type: 'int',
      nullable: false,
      name: 'role_id',
      comment: 'ID của vai trò (khóa ngoại)',
    })
    roleId: number;
  
    @CreateDateColumn({ // TypeORM sẽ tự quản lý cột này khi bản ghi được tạo
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP(6)',
      name: 'assigned_at',
      comment: 'Thời điểm vai trò được gán',
    })
    assignedAt: Date;
  
    @Column({
      type: 'boolean',
      default: true,
      nullable: false,
      name: 'is_active',
      comment: 'Vai trò này có đang hoạt động cho tài khoản này không',
    })
    isActive: boolean;
  
    /**
     * Mối quan hệ Many-to-One với Account.
     * Nhiều bản ghi AccountRole có thể thuộc về một Account.
     */
    @ManyToOne(() => Account, (account) => account.accountRoles, {
      onDelete: 'CASCADE', // Nếu Account bị xóa, các gán vai trò của nó cũng bị xóa
      onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
    account: Account;
  
    /**
     * Mối quan hệ Many-to-One với Role.
     * Nhiều bản ghi AccountRole có thể tham chiếu đến cùng một Role.
     */
    @ManyToOne(() => Role, (role) => role.accountRoles, {
      onDelete: 'CASCADE', // Nếu Role bị xóa, các gán vai trò đó cũng bị xóa
      onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role: Role;
  }