import {
    BadRequestException,
    ConflictException, 
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Repository } from 'typeorm';
  import * as argon2 from 'argon2';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { InjectRepository } from '@nestjs/typeorm';
  import { MailerProducer } from 'src/queue/producers/mailer.producer'; 
  import { RoleName } from '../role/enum/role.enum';
  import { Account, AccountStatus } from '../account/entities/account.entities';
  import { Role } from '../role/entities/role.entities'; 
  import { AccountRole } from '../account_role/entities/account_role.entities'; 
  import { UserProfile } from '../user_profile/entitie/user_profiles.entities'; 
  import { Response } from 'express';
  
  import { LoginDto, RegisterDto, CreateAdminDto } from './auth.dto'; 
  import { v4 as uuidv4 } from 'uuid'; 
  
  @Injectable()
  export class AuthService {
    private readonly tokenBlacklist = new Set<string>();
  
    constructor(
      @InjectRepository(Account)
      private readonly accountRepository: Repository<Account>,
      @InjectRepository(AccountRole)
      private readonly accountRoleRepository: Repository<AccountRole>,
      @InjectRepository(UserProfile) 
      private readonly userProfileRepository: Repository<UserProfile>,
      @InjectRepository(Role) 
      private readonly roleRepository: Repository<Role>,

      private config: ConfigService,
      private jwt: JwtService,
      private readonly mailerProducer: MailerProducer,
    ) {}
  
    async register(dto: RegisterDto) {
      const { username, email, password, name } = dto;
  
      // Check if username or email already exists
      const existingAccount = await this.accountRepository.findOne({
        where: [{ username }, { userProfile: { email } }],
        relations: ['userProfile'],
      });
  
      if (existingAccount) {
        throw new ConflictException('Username or email already exists');
      }
  
      // Find user role
      const userRole = await this.roleRepository.findOne({
        where: { name: RoleName.USER },
      });
  
      if (!userRole) {
        throw new NotFoundException('User role not found');
      }
  
      // Hash password
      const hashedPassword = await argon2.hash(password);
  
      // Create new account
      const account = this.accountRepository.create({
        id: uuidv4(),
        username,
        password: hashedPassword,
        status: AccountStatus.ACTIVE,
      });
      await this.accountRepository.save(account);
  
      // Create user profile
      const userProfile = this.userProfileRepository.create({
        accountId: account.id,
        email,
        fullName: name,
      });
      await this.userProfileRepository.save(userProfile);
  
      // Assign user role
      const accountRole = this.accountRoleRepository.create({
        accountId: account.id,
        roleId: userRole.id,
        isActive: true,
      });
      await this.accountRoleRepository.save(accountRole);
  
      return {
        message: 'Registration successful',
        account: {
          id: account.id,
          username: account.username,
          email: userProfile.email,
          name: userProfile.fullName,
          role: RoleName.USER,
        },
      };
    }
  
    async login(dto: LoginDto, response: Response) {
      const { loginIdentifier, password } = dto;
      
  
      // Find account by username or email
      const account = await this.accountRepository.findOne({
        where: [
          { username: loginIdentifier },
          { userProfile: { email: loginIdentifier } },
        ],
        relations: ['userProfile', 'accountRoles', 'accountRoles.role'],
      });
      if (!account) {
        throw new UnauthorizedException('Sai thông tin đăng nhập');
      }

      // Verify password
      const isPasswordValid = await argon2.verify(account.password, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Sai mật khẩu');
      }
  
      // Get active role
      const activeRole = account.accountRoles?.find(ar => ar.isActive)?.role;
      if (!activeRole) {
        throw new UnauthorizedException('No active role found');
      }
  
      // Generate tokens
      const tokens = await this.generateTokens(account.id, account.username, activeRole.name);
  
      return {
        message: 'Login successful',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        account: {
          id: account.id,
          username: account.username,
          email: account.userProfile?.email,
          name: account.userProfile?.fullName,
          role: activeRole.name,
        },
      };
    }
  
    async generateTokens(userId: string, username: string, role: string) {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwt.signAsync(
          {
            sub: userId,
            username,
            role,
          },
          {
            secret: this.config.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: '30m',
          },
        ),
        this.jwt.signAsync(
          {
            sub: userId,
            username,
            role,
          },
          {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
          },
        ),
      ]);
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    private setRefreshTokenCookie(response: Response, refreshToken: string) {
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  
    async refreshToken(refreshToken: string) {
      try {
        // Verify refresh token
        const payload = await this.jwt.verifyAsync(refreshToken, {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        });

        // Get user from database
        const account = await this.accountRepository.findOne({
          where: { id: payload.sub },
          relations: ['userProfile', 'accountRoles', 'accountRoles.role'],
        });

        if (!account) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        // Generate new access token
        const accessToken = await this.generateAccessToken(account);

        return {
          accessToken,
          refreshToken, // Return the same refresh token
        };
      } catch (error) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    }
  
    private async generateAccessToken(account: Account) {
      const roles = account.accountRoles.map((ar) => ar.role.name);
      const payload = {
        sub: account.id,
        username: account.username,
        roles: roles,
      };

      return this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '30m',
      });
    }
  
    private async generateRefreshToken(account: Account) {
      const payload = {
        sub: account.id,
        tokenId: uuidv4(),
      };

      return this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // Refresh token valid for 7 days
      });
    }
  
    async logout(response: Response, token: string) {
      try {
        // Verify token
        const payload = await this.jwt.verifyAsync(token, {
          secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        });
  
        // Add token to blacklist
        this.tokenBlacklist.add(token);
  
        // Clear refresh token cookie
        response.clearCookie('refreshToken', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
  
        return {
          message: 'Logout successful',
        };
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }
  
    isTokenBlacklisted(token: string): boolean {
      return this.tokenBlacklist.has(token);
    }
  
    async createAdmin(dto: CreateAdminDto) {
      const { username, email, password, name } = dto;
  
      // Check if username or email already exists
      const existingAccount = await this.accountRepository.findOne({
        where: [{ username }, { userProfile: { email } }],
        relations: ['userProfile'],
      });
  
      if (existingAccount) {
        throw new ConflictException('Username or email already exists');
      }
  
      // Find admin role
      const adminRole = await this.roleRepository.findOne({
        where: { name: RoleName.ADMIN },
      });
  
      if (!adminRole) {
        throw new NotFoundException('Admin role not found');
      }
  
      // Hash password
      const hashedPassword = await argon2.hash(password);
  
      // Create new account
      const account = this.accountRepository.create({
        id: uuidv4(),
        username,
        password: hashedPassword,
        status: AccountStatus.ACTIVE,
      });
      await this.accountRepository.save(account);
  
      // Create user profile
      const userProfile = this.userProfileRepository.create({
        accountId: account.id,
        email,
        fullName: name,
      });
      await this.userProfileRepository.save(userProfile);
  
      // Assign admin role
      const accountRole = this.accountRoleRepository.create({
        accountId: account.id,
        roleId: adminRole.id,
        isActive: true,
      });
      await this.accountRoleRepository.save(accountRole);
  
      return {
        message: 'Admin account created successfully',
        account: {
          id: account.id,
          username: account.username,
          email: userProfile.email,
          name: userProfile.fullName,
          role: RoleName.ADMIN,
        },
      };
    }
  
    // Bạn có thể cần thêm các phương thức khác như refreshToken, forgotPassword, resetPassword, verifyEmail...
  }