// src/modules/user/user-profile.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entitie/user_profiles.entities';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    // @InjectRepository(Account) // Có thể cần nếu bạn muốn kiểm tra Account tồn tại
    // private readonly accountRepository: Repository<Account>,
  ) {}

}