import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, CreateAdminDto } from './auth.dto';
import { Public } from './decorator/public.decorator';
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './decorator/roles.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Tài khoản đã tồn tại' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không chính xác' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(dto, response);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiResponse({ status: 200, description: 'Làm mới token thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({ status: 204, description: 'Đăng xuất thành công' })
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization?.split(' ')[1];
    if (token) {
      await this.authService.logout(response, token);
    }
  }

  @Public()
  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo tài khoản admin mới' })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản admin thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Tài khoản đã tồn tại' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(dto);
  }
}