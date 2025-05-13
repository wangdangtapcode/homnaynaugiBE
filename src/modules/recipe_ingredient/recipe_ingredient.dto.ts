import { IsArray, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class IngredientSearchItem {
  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: '550e8400-e29b-41d4-a716-446655440114'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Số lượng nguyên liệu',
    example: 2000
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'ID của đơn vị đo (1: gram, 2: kg, 3: ml, 4: l, 5: cái, 6: thìa cà phê, 7: thìa canh)',
    example: 6
  })
  @IsNumber()
  unit: number;
}

export class FindRecipesByIngredientsDto {
  @ApiProperty({
    description: 'Danh sách nguyên liệu cần tìm',
    type: [IngredientSearchItem],
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440118',
        quantity: 2000,
        unit: 6
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440137',
        quantity: 2000,
        unit: 1
      }
    ]
  })
  @IsArray()
  @Type(() => IngredientSearchItem)
  ingredients: IngredientSearchItem[];
}
