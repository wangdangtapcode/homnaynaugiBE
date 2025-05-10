
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    // UseGuards, // Nếu bạn cần bảo vệ các route
    // HttpCode,
    // HttpStatus,
  } from '@nestjs/common';
  import { UserProfileService } from './user_profile.service';

  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
  import { UserProfile } from './entitie/user_profiles.entities';
  
  @ApiTags('User Profiles')
  @ApiBearerAuth() // Yêu cầu xác thực cho tất cả các API trong controller này
  // @UseGuards(AuthGuard('jwt')) // Ví dụ: Bảo vệ tất cả các route bằng JWT AuthGuard
  @Controller('user-profiles') // Đường dẫn cơ sở /user-profiles
  export class UserProfileController {
    constructor(private readonly userProfileService: UserProfileService) {}

  }