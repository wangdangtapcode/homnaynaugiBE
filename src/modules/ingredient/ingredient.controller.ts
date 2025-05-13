import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { SearchIngredientQueryDto, FindIngredientsByNamesDto } from './ingredient.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm nguyên liệu' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  @ApiQuery({ name: 'categoryIds', required: false, description: 'ID danh mục' })
  async searchIngredients(@Query() queryDto: SearchIngredientQueryDto) {
    return this.ingredientService.searchIngredients(queryDto);
  }

  @Post('find-by-names')
  @ApiOperation({ summary: 'Tìm kiếm nguyên liệu theo danh sách tên' })
  async findIngredientsByNames(@Body() dto: FindIngredientsByNamesDto) {
    return this.ingredientService.findIngredientsByNames(dto.names);
  }
}
