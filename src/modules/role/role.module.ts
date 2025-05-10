// src/modules/role/role.module.ts

import { Module, OnModuleInit } from '@nestjs/common'; // Thêm OnModuleInit nếu bạn muốn seed
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entities';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService], // Export service nếu bạn muốn sử dụng nó ở các module khác (ví dụ: AccountRoleService)
})
export class RoleModule implements OnModuleInit { // Implement OnModuleInit
  constructor(private readonly roleService: RoleService) {}

  // Phương thức này sẽ được gọi khi module đã được khởi tạo
  async onModuleInit() {
    // await this.roleService.seedInitialRoles(); // Gọi hàm seed
    // console.log('RoleModule has been initialized and roles seeded (if necessary).');
  }
}