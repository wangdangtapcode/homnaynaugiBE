import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { RecipeCategoryMappingService } from './recipe_category_mapping.service';

@ApiTags('Recipe Category Mappings')
@Controller('recipe-category-mappings')
export class RecipeCategoryMappingController {
  constructor(private readonly mappingService: RecipeCategoryMappingService) {}

  @Get('search-recipes')
  @ApiOperation({ summary: 'Tìm món ăn theo tên danh mục (match tên)' })
  @ApiQuery({ name: 'categoryId', required: true, description: 'ID danh mục món ăn' })
  async searchRecipesByCategoryName(@Query('categoryId', ParseIntPipe) categoryId: number) {
    return this.mappingService.getRecipesByCategoryNameMatch(categoryId);
  }
}
