import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountPantryItemDto {
  @ApiProperty({
    description: 'Array of ingredient IDs to add to pantry',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51d3-12a4-b456-426614174000'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredientIds: string[];
}

export class DeleteMultiplePantryItemsDto {
  @ApiProperty({ type: [String], description: 'Danh sách ID nguyên liệu cần xóa' })
  @IsArray()
  @IsString({ each: true })
  ingredientIds: string[];
}
