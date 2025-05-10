
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRole } from './entities/account_role.entities';
// Import Account và Role entities nếu cần kiểm tra sự tồn tại của chúng
// import { Account } from '../account/entities/account.entity';
// import { Role } from '../role/entities/role.entity';

@Injectable()
export class AccountRoleService {
  constructor(
    @InjectRepository(AccountRole)
    private readonly accountRoleRepository: Repository<AccountRole>,
    // @InjectRepository(Account) // Ví dụ nếu bạn cần kiểm tra Account
    // private readonly accountRepository: Repository<Account>,
    // @InjectRepository(Role)    // Ví dụ nếu bạn cần kiểm tra Role
    // private readonly roleRepository: Repository<Role>,
  ) {}

}