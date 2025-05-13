import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entities';
import { AccountService } from './account.service';
import { UserProfile } from '../user_profile/entitie/user_profiles.entities';
import { AccountRole } from '../account_role/entities/account_role.entities';
import { Role } from '../role/entities/role.entities';
import { AccountController } from './account.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, UserProfile, AccountRole, Role]),
    forwardRef(() => AuthModule)
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}