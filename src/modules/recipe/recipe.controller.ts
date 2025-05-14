import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { SearchRecipeQueryDto } from './recipe.dto';
import { ApiOperation, ApiQuery, ApiTags, ApiParam, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get("search")
  @ApiOperation({ summary: 'Tìm kiếm công thức công khai' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức (PUBLIC, PRIVATE, DRAFT)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu (mặc định: 0)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ status: 200, description: 'Danh sách công thức công khai' })
  async searchRecipes(@Query() queryDto: SearchRecipeQueryDto) {
    return this.recipeService.searchRecipes(queryDto);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách công thức của user đang đăng nhập' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức (PUBLIC, PRIVATE, DRAFT)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu (mặc định: 0)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ status: 200, description: 'Danh sách công thức của user' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Chưa đăng nhập' })
  async getMyRecipes(@Query() queryDto: SearchRecipeQueryDto, @Request() req) {
    return this.recipeService.searchRecipes({
      ...queryDto,
      accountId: req.user.id
    });
  }
}
