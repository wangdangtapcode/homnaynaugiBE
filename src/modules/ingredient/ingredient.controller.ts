import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { SearchIngredientQueryDto, FindIngredientsByNamesDto } from './ingredient.dto';
import { IngredientResponseDto } from './ingredient.dto';
import { ApiOperation, ApiQuery, ApiTags,ApiOkResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorator/public.decorator';
@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm nguyên liệu' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  @ApiQuery({ name: 'categoryIds', required: false, description: 'ID danh mục' })
  async searchIngredients(@Query() queryDto: SearchIngredientQueryDto) {
    return this.ingredientService.searchIngredients(queryDto);
  }

  @Get('suggested')
  @ApiOperation({ summary: 'Lấy danh sách nguyên liệu ngẫu nhiên gợi ý' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng nguyên liệu trả về', example: 6 })
  async getSuggestedIngredients(@Query('limit') limit?: number) {
    return this.ingredientService.getRandomIngredients(limit);
  }

  @Get()
  @ApiOkResponse({ type: [IngredientResponseDto], description: 'Danh sách tất cả nguyên liệu' })
  getAllIngredients(): Promise<IngredientResponseDto[]> {
    return this.ingredientService.getAllIngredients();
  }

  @Post('find-by-names')
  @ApiOperation({ summary: 'Tìm kiếm nguyên liệu theo danh sách tên' })
  async findIngredientsByNames(@Body() dto: FindIngredientsByNamesDto) {
    return this.ingredientService.findIngredientsByNames(dto.names);
  }
}
