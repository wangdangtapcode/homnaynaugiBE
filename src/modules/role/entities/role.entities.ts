
import { AccountRole } from '../../account_role/entities/account_role.entities'; 
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RoleName } from '../enum/role.enum';


@Entity('roles') 
export class Role {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column({
    type: 'enum', // Kiểu dữ liệu VARCHAR
    unique: true,    // Giá trị trong cột này phải là duy nhất
    nullable: false, // Không cho phép giá trị NULL
    name: 'name',
    enum: RoleName,
    default: RoleName.USER    // Tên cột trong cơ sở dữ liệu (có thể bỏ qua nếu tên thuộc tính và tên cột giống nhau)
  })
  name: RoleName; // Thuộc tính để lưu tên vai trò.
                // Bạn cũng có thể xem xét việc sử dụng kiểu RoleName ở đây:
                // name: RoleName;
                // Nếu vậy, cột trong CSDL nên là kiểu ENUM(RoleName.ADMIN, RoleName.USER, ...)
                // Hoặc bạn vẫn để là VARCHAR và thực hiện validate ở tầng service/DTO
                // để đảm bảo name là một trong các giá trị của RoleName.

  /**
   * Mối quan hệ One-to-Many với thực thể AccountRole.
   * Một vai trò (Role) có thể được gán cho nhiều tài khoản thông qua bảng AccountRole.
   */
  @OneToMany(() => AccountRole, (accountRole) => accountRole.role)
  accountRoles: AccountRole[]; // Mảng các bản ghi AccountRole liên quan đến vai trò này.
                                // Thuộc tính này không tạo cột trong bảng 'roles',
                                // nó chỉ dùng để TypeORM quản lý mối quan hệ.
}