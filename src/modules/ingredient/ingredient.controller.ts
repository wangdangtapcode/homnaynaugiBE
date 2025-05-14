import { Controller, Get, Query } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { SearchIngredientQueryDto } from './ingredient.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
}
