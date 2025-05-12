import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountStatus } from './entities/account.entities';
import { UserProfile } from '../user_profile/entitie/user_profiles.entities';
import { AccountRole } from '../account_role/entities/account_role.entities';
import { Role } from '../role/entities/role.entities';
import { RoleName } from '../role/enum/role.enum';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(AccountRole)
    private readonly accountRoleRepository: Repository<AccountRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findByUsername(username: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { username },
      relations: ['userProfile', 'accountRoles', 'accountRoles.role'],
    });
  }

  async getUserRoles(accountId: string): Promise<Role[]> {
    const accountRoles = await this.accountRoleRepository.find({
      where: { accountId, isActive: true },
      relations: ['role'],
    });
    return accountRoles.map(ar => ar.role);
  }

  async findByUsernameOrEmail(username: string, email: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: [
        { username },
        { userProfile: { email } },
      ],
      relations: ['userProfile', 'accountRoles', 'accountRoles.role'],
    });
  }

  async findById(id: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { id },
      relations: ['userProfile', 'accountRoles', 'accountRoles.role'],
    });
  }

  async create(data: {
    username: string;
    password: string;
    email: string;
    name: string;
    role: RoleName;
  }): Promise<Account> {
    // Find role
    const role = await this.roleRepository.findOne({
      where: { name: data.role },
    });

    if (!role) {
      throw new NotFoundException(`Role ${data.role} not found`);
    }

    // Create account
    const account = this.accountRepository.create({
      username: data.username,
      password: data.password,
      status: AccountStatus.ACTIVE,
    });
    await this.accountRepository.save(account);

    // Create user profile
    const userProfile = this.userProfileRepository.create({
      accountId: account.id,
      email: data.email,
      fullName: data.name,
    });
    await this.userProfileRepository.save(userProfile);

    // Assign role
    const accountRole = this.accountRoleRepository.create({
      accountId: account.id,
      roleId: role.id,
      isActive: true,
    });
    await this.accountRoleRepository.save(accountRole);

    const createdAccount = await this.findById(account.id);
    if (!createdAccount) {
      throw new Error('Failed to create account');
    }
    return createdAccount;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.accountRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }
}