import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entities';
import { AccountService } from './account.service';
import { UserProfile } from '../user_profile/entitie/user_profiles.entities';
import { AccountRole } from '../account_role/entities/account_role.entities';
import { Role } from '../role/entities/role.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, UserProfile, AccountRole, Role]),
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}