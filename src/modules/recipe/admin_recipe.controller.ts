import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, SearchRecipeQueryDto } from './recipe.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleName } from '../role/enum/role.enum';

@ApiTags('Admin/Recipes')
@Controller('admin/recipes')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminRecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post("create")
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tạo mới công thức (Admin)' })
  async createRecipe(@Body() dto: CreateRecipeDto) {
    return this.recipeService.createRecipe(dto);
  }
  @Get("search")
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tìm kiếm công thức' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  async searchRecipes(@Query() queryDto: SearchRecipeQueryDto) {
    return this.recipeService.searchRecipes(queryDto);
  }
}
