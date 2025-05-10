import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateIngredientCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục nguyên liệu',
    example: 'Rau củ',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name: string;

  @ApiProperty({
    description: 'URL hình ảnh danh mục',
    example: 'https://example.com/images/vegetables.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
