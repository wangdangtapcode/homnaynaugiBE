// src/modules/user/dto/update-user-profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsPhoneNumber, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'JohnD' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;
}
