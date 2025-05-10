// src/modules/auth/dto/auth.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RoleName } from '../role/enum/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  loginIdentifier: string; // Có thể là username hoặc email

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Mật khẩu phải có ít nhất 1 ký tự' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class CreateAdminDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Administrator' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Mật khẩu phải có ít nhất 1 ký tự' })
  password: string;
}