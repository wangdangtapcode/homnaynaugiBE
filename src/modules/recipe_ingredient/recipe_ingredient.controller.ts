import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RecipeIngredientService } from './recipe_ingredient.service';
import { FindRecipesByIngredientsDto } from './recipe_ingredient.dto';

@ApiTags('Công thức theo nguyên liệu')
@Controller('recipe-ingredients')
export class RecipeIngredientController {
  constructor(private readonly recipeIngredientService: RecipeIngredientService) {}

  @Post('find-recipes')
  @ApiOperation({ 
    summary: 'Tìm công thức dựa trên danh sách nguyên liệu',
    description: `
    Tìm kiếm công thức dựa trên danh sách nguyên liệu với các điều kiện:
    - Khớp chính xác đơn vị đo
    - Số lượng cho phép sai số 20%
    - Yêu cầu tối thiểu 80% match
    - Sắp xếp theo % match giảm dần
    `
  })
  @ApiBody({ type: FindRecipesByIngredientsDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách công thức phù hợp',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
              name: { type: 'string', example: 'Bò xào nấm' },
              description: { type: 'string', example: 'Món bò xào nấm thơm ngon' },
              imageUrl: { type: 'string', example: 'https://example.com/bo-xao-nam.jpg' },
              preparationTimeMinutes: { type: 'number', example: 30 },
              matchPercentage: { type: 'number', example: 85 },
              matchedIngredients: { type: 'number', example: 3 },
              totalIngredients: { type: 'number', example: 5 },
              ingredients: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                    isMatched: { type: 'boolean' }
                  }
                }
              }
            }
          }
        },
        total: { type: 'number', example: 10 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async findRecipesByIngredients(@Body() dto: FindRecipesByIngredientsDto) {
    return this.recipeIngredientService.findRecipesByIngredients(dto);
  }
}
