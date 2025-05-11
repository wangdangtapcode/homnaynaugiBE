import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { InjectRepository } from '@nestjs/typeorm';
  import * as jwt from 'jsonwebtoken';
  import { Repository } from 'typeorm';
  import { Reflector } from '@nestjs/core';
  import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
  import { Account } from '../../account/entities/account.entities';
  import { AuthService } from '../auth.service';

  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private config: ConfigService,
      @InjectRepository(Account)
      private readonly accountRepository: Repository<Account>,
      private reflector: Reflector,
      private readonly authService: AuthService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) return true;
  
      const request = context.switchToHttp().getRequest();
      console.log('Request headers:', request.headers);
      
      const authHeader = request.headers['authorization'];
      console.log('Auth header:', authHeader);
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No authorization header or invalid format');
        throw new UnauthorizedException('Bạn chưa đăng nhập!');
      }
  
      const token = authHeader.split(' ')[1].trim();
      console.log('Token received:', token);
  
      // Kiểm tra token có trong blacklist không
      if (this.authService.isTokenBlacklisted(token)) {
        console.log('Token is blacklisted');
        throw new UnauthorizedException('Token đã bị vô hiệu hóa');
      }
  
      try {
        const secret = this.config.get<string>('JWT_ACCESS_SECRET');
        console.log('JWT_ACCESS_SECRET from config:', secret);
        
        if (!secret) {
          console.error('JWT_ACCESS_SECRET is not configured');
          throw new Error('JWT_ACCESS_SECRET is not configured');
        }
  
        console.log('Verifying token with secret:', secret);
        const decoded = jwt.verify(token, secret) as any;
        console.log('Token decoded:', decoded);
  
        // Sử dụng thông tin trực tiếp từ token
        request.user = {
          id: decoded.sub,
          username: decoded.username,
          role: decoded.roles,
        };
        console.log('User set in request:', request.user);
  
        return true;
      } catch (error) {
        console.error('Token verification failed:', error.message);
        console.error('Error stack:', error.stack);
        throw new UnauthorizedException('Token không hợp lệ');
      }
    }
  }