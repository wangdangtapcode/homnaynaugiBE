import { Controller, Post, Body, UseGuards, Get, Query, Request, UseInterceptors, UploadedFiles, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UpdateUserProfileDto } from './user_profile.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleName } from '../role/enum/role.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { UserProfileService } from './user_profile.service';

@ApiTags('Admin/User-Profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@Controller('admin/user-profiles')

export class AdminUserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả hồ sơ người dùng' })
  async findAll() {
    return this.userProfileService.findAllProfiles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy hồ sơ người dùng theo ID' })
  async findOne(@Param('id') id: string) {
    return this.userProfileService.findProfileById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật hồ sơ người dùng theo ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserProfileDto) {
    return this.userProfileService.adminUpdateUserProfile(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá hồ sơ người dùng' })
  async remove(@Param('id') id: string) {
    return this.userProfileService.deleteUserProfile(id);
  }
}