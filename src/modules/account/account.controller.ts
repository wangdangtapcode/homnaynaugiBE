import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AccountService } from './account.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin profile của user đang đăng nhập' })
  async getProfile(@Request() req) {
    const account = await this.accountService.findById(req.user.id);
    
    if (!account) {
      throw new NotFoundException('Không tìm thấy thông tin tài khoản');
    }

    return {
      statusCode: 200,
      message: 'Lấy thông tin profile thành công',
      data: {
        name: account.userProfile?.fullName,
        avatarUrl: account.userProfile?.avatarUrl
      }
    };
  }
}