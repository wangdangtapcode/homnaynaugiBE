import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { IngredientService } from '../ingredient/ingredient.service';
import { SearchIngredientQueryDto } from './ingredient.dto';
import { RoleName } from '../role/enum/role.enum';

@ApiTags('Admin/Ingredients')
@Controller('admin/ingredients')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminIngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get('search')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tìm kiếm nguyên liệu' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  @ApiQuery({ name: 'categoryIds', required: false, description: 'ID danh mục' })
  async searchIngredients(@Query() queryDto: SearchIngredientQueryDto) {
    return this.ingredientService.searchIngredients(queryDto);
  }
}
