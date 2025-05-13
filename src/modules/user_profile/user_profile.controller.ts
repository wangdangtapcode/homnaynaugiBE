// src/modules/user/user-profile.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleName } from '../role/enum/role.enum';

import { UserProfileService } from './user_profile.service';
import { UpdateUserProfileDto } from './user_profile.dto';
import { UserProfile } from './entitie/user_profiles.entities';

@ApiTags('User Profiles')
@ApiBearerAuth()
@Controller('user-profiles')
@UseGuards(AuthGuard, RolesGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get('me')
  @Roles(RoleName.USER)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ cá nhân' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
  async getProfile(@Request() req): Promise<{ message: string; data: UserProfile }> {
    const accountId = req.user.id;
    const profile = await this.userProfileService.getProfile(accountId);
    return {
      message: 'Lấy thông tin thành công',
      data: profile,
    };
  }

  @Patch('me')
  @Roles(RoleName.USER)
  @ApiOperation({ summary: 'Cập nhật hồ sơ cá nhân' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  
  async updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() updatedData: UpdateUserProfileDto,
    @Request() req,
  ): Promise<{ message: string; data: UserProfile }> {
    const accountId = req.user.id;

    if (avatar) {
      updatedData.avatarUrl = `/uploads/avatars/${avatar.filename}`;
    }

    const profile = await this.userProfileService.updateProfile(accountId, updatedData);
    return {
      message: 'Cập nhật thành công',
      data: profile,
    };
  }
}
