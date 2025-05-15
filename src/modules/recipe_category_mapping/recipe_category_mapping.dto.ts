import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class GetRecipesByCategoryDto {
  @ApiProperty({ example: 1, description: 'ID của danh mục món ăn' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 'phở', description: 'Từ khóa tìm kiếm tên món ăn' })
  @IsString()
  query: string;
}
