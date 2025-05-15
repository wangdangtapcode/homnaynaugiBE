// src/modules/user/user-profile.module.ts (Hoặc user.module.ts)

import { Module, forwardRef } from '@nestjs/common'; // forwardRef có thể cần nếu có circular dependency
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entitie/user_profiles.entities';
import { UserProfileService } from './user_profile.service';
import { UserProfileController } from './user_profile.controller';
import { Account } from '../account/entities/account.entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, Account]),
    AuthModule,
    // forwardRef(() => AccountModule), // Sử dụng forwardRef nếu AccountModule cũng import UserProfileModule
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService], // Export service nếu bạn muốn AccountService gọi các phương thức của nó
})
export class UserProfileModule {}