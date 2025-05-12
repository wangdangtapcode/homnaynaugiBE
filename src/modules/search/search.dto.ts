import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsNumber, IsIn } from 'class-validator';

export class SearchRecipeQueryDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên món, nguyên liệu, danh mục)' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'ID của danh mục món ăn' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Danh sách ID nguyên liệu, phân tách bằng dấu phẩy' })
  @IsOptional()
  @IsString()
  ingredientIds?: string; // sẽ được tách ở service thành mảng
}
