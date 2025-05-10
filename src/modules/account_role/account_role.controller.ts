// src/modules/account-role/account-role.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe, // Dùng để parse ID từ string sang number
    HttpCode,
    HttpStatus,
    // Query, // Nếu bạn cần query parameters
  } from '@nestjs/common';
  import { AccountRoleService } from './account_role.service';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
  import { AccountRole } from './entities/account_role.entities';
  
  @ApiTags('Account Roles') // Tag cho Swagger UI
  @Controller('account-roles') // Đường dẫn cơ sở cho controller này là /account-roles
  export class AccountRoleController {
    constructor(private readonly accountRoleService: AccountRoleService) {}


  }