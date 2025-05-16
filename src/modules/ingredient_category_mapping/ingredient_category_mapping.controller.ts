import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { IngredientCategoryService } from './ingredient_category_mapping.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/decorator/public.decorator';
import { Query,Req, Post, UseGuards, UseInterceptors, UploadedFiles, Body, Put, Request} from '@nestjs/common';


@Controller('ingredient-categories')
export class IngredientCategoryController {
  constructor(private readonly categoryService: IngredientCategoryService) {}

  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Get(':id/ingredients')
  async getIngredientsByCategory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoryService.getIngredientsByCategory(id);
  }

  @Get("search")
      @Public()
      @ApiOperation({ summary: 'Lấy danh sách danh mục món ăn' })
      @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
      @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
      @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
      @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
      async findAll(
        @Query('query') query?: string,
        @Query('offset', ParseIntPipe) offset?: number,
        @Query('limit', ParseIntPipe) limit?: number,
      ) {
        const { data, total } = await this.recipeCategoryService.findAll(query, offset, limit);
        return {
          message: 'Lấy danh sách thành công',
          data,
          total,
        };
      }
}
