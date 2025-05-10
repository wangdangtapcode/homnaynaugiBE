
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    // Patch, // Uncomment nếu bạn implement update
  } from '@nestjs/common';
  import { RoleService } from './role.service';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
  import { Role } from './entities/role.entities';
  
  @ApiTags('Roles') // Tag cho Swagger UI
  @Controller('roles') // Đường dẫn cơ sở cho controller này là /roles
  export class RoleController {
    constructor(private readonly roleService: RoleService) {}

  }