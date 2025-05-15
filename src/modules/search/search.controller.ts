// search/controller/search.controller.ts
import { Controller, Get, Query, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SearchService } from '../search/search.service';
import { CloudinaryService } from "src/config/cloudinary/cloudinary.service";
import { ApiOkResponse } from '@nestjs/swagger';
import { Recipe } from './entities/search.entities';
import { SearchRecipeQueryDto } from './search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('recipes')
  @ApiOperation({ summary: 'Tìm kiếm món ăn theo tên, danh mục hoặc nguyên liệu' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'categoryRecipeId', required: false })
  @ApiQuery({ name: 'ingredientIds', required: false, description: 'Mảng ID nguyên liệu, phân tách bằng dấu phẩy' })
  @ApiResponse({ status: 200, description: 'Danh sách công thức phù hợp' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async searchRecipes(@Query() query: any) {
    try {
      const result = await this.searchService.searchRecipes(query);
      return { message: 'Tìm kiếm thành công', data: result };
    } catch (error) {
      throw new InternalServerErrorException('Không thể tìm kiếm công thức');
    }
  }

  @Get('recipes/by-ingredients')
  @ApiOperation({ summary: 'Tìm món ăn theo danh sách nguyên liệu' })
  @ApiQuery({ name: 'ids', required: true, description: 'Danh sách ID nguyên liệu, phân tách bằng dấu phẩy' })
  @ApiResponse({ status: 200, description: 'Danh sách công thức theo nguyên liệu' })
  @ApiResponse({ status: 400, description: 'Thiếu danh sách nguyên liệu' })
  async getRecipesByIngredients(@Query('ids') ids: string) {
    if (!ids) throw new BadRequestException('Thiếu danh sách nguyên liệu');
    return { message: 'Tìm kiếm theo nguyên liệu thành công', data: await this.searchService.getRecipesByIngredientIds(ids) };
  }

  @Get('recipes/popular')
  @ApiOperation({ summary: 'Lấy danh sách món ăn phổ biến' })
  @ApiResponse({ status: 200, description: 'Danh sách món phổ biến' })
  async getPopularRecipes() {
    return { message: 'Lấy món ăn phổ biến thành công', data: await this.searchService.getPopularRecipes() };
  }

  @Get('ingredients')
  @ApiOperation({ summary: 'Lấy danh sách nguyên liệu' })
  @ApiResponse({ status: 200, description: 'Danh sách nguyên liệu' })
  async getIngredients() {
    return { message: 'Lấy danh sách nguyên liệu thành công', data: await this.searchService.getAllIngredients() };
  }

  @Get('recipe-categories')
  @ApiOperation({ summary: 'Lấy danh mục công thức theo loại (ví dụ: meal)' })
  @ApiQuery({ name: 'type', required: false, description: 'Loại danh mục (ví dụ: meal)' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục công thức' })
  async getRecipeCategories(@Query('type') type: string) {
    return { message: 'Lấy danh mục công thức thành công', data: await this.searchService.getRecipeCategories(type) };
  }

  @Get('recipes2')
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiOkResponse({ type: [Recipe] })
  search(@Query() queryDto: SearchRecipeQueryDto): Promise<Recipe[]> {
    return this.searchService.searchRecipes2(queryDto);
  }
}
