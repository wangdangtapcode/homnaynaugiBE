import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/entities/account.entities';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MailerProducer } from '../../queue/producers/mailer.producer';
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { AccountRole } from '../account_role/entities/account_role.entities';
import { UserProfile } from '../user_profile/entitie/user_profiles.entities';
import { Role } from '../role/entities/role.entities';
import { AccountModule } from '../account/account.module';
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Account, AccountRole, UserProfile, Role]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'mailer-queue',
    }),
    forwardRef(() => AccountModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailerProducer, AuthGuard, RolesGuard],
  exports: [AuthService, AuthGuard, RolesGuard,JwtModule],
})
export class AuthModule {}