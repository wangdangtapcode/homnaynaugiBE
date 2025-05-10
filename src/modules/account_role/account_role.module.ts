// src/modules/account-role/account-role.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRole } from './entities/account_role.entities';
import { AccountRoleService } from './account_role.service';
import { AccountRoleController } from './account_role.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountRole]),
    // AccountModule, // Uncomment nếu cần AccountRepository
    // RoleModule,    // Uncomment nếu cần RoleRepository
  ],
  controllers: [AccountRoleController],
  providers: [AccountRoleService],// Export service nếu bạn muốn sử dụng nó ở các module khác
})
export class AccountRoleModule {}