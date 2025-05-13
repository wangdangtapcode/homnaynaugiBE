// src/modules/user/user-profile.service.ts

import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entitie/user_profiles.entities';
import { Account } from '../account/entities/account.entities';
import { RoleName } from '../role/enum/role.enum';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  private extractRoles(account: Account): string[] {
    return account.accountRoles
      .filter(role => role.isActive)
      .map(role => role.role.name.toLowerCase());
  }

  async getProfile(accountId: string): Promise<UserProfile> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['accountRoles', 'accountRoles.role'],
    });

    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    const roles = this.extractRoles(account);

    if (roles.includes(RoleName.ADMIN.toLowerCase())) {
      throw new ForbiddenException('Không thể truy cập profile của admin');
    }

    if (!roles.includes(RoleName.USER.toLowerCase())) {
      throw new ForbiddenException('Tài khoản không có quyền truy cập');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { accountId },
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy thông tin profile');
    }

    return profile;
  }

  async updateProfile(accountId: string, updateData: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile(accountId);
    Object.assign(profile, updateData);
    return await this.userProfileRepository.save(profile);
  }
}