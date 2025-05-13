import { Controller, Get, Query, Param } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { SearchRecipeQueryDto } from './recipe.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Recipe } from './entities/recipe.entities';



@ApiTags('Recipes')
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get("search")
  @ApiOperation({ summary: 'Tìm kiếm công thức' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  async searchRecipes(@Query() queryDto: SearchRecipeQueryDto) {
    return this.recipeService.searchRecipes(queryDto);
  }

  @Get('top-favorites')
  async getTopFavoriteRecipes(
    @Query('limit') limit?: number,
  ): Promise<Recipe[]> {
    const recipeLimit = limit && +limit > 0 ? +limit : 5;
    return this.recipeService.getTopFavoriteRecipes(recipeLimit);
  }


 
}
