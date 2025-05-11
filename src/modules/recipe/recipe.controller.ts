import { Controller, Get, Query, Delete, Param, NotFoundException, Post, Body } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, SearchRecipeQueryDto } from './recipe.dto';
import { ApiOperation, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm công thức' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  async searchRecipes(@Query() queryDto: SearchRecipeQueryDto) {
    return this.recipeService.searchRecipes(queryDto);
  }
  @Post()
  async createRecipe(@Body() dto: CreateRecipeDto) {
    return this.recipeService.createRecipe(dto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa công thức' })
  @ApiParam({ name: 'id', description: 'ID của công thức' })
  async deleteRecipe(@Param('id') id: string) {
    const deleted = await this.recipeService.deleteRecipe(id);
    if (!deleted) throw new NotFoundException('Recipe not found');
    return { message: 'Recipe deleted successfully' };
  }
}
