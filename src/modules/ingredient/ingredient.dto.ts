import { IsOptional, IsString, IsNumber, Min, IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchIngredientQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  categoryIds?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class IngredientResponseDto {
  @ApiProperty({ description: 'UUID của nguyên liệu', example: 'd9b7b0e6-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  id: string;

  @ApiProperty({ description: 'Tên nguyên liệu', example: 'Bò' })
  name: string;

  @ApiProperty({ description: 'Link ảnh của nguyên liệu', example: 'https://example.com/image.png', required: false })
  imageUrl?: string | null;

  @ApiProperty({ description: 'Danh mục nguyên liệu', type: 'array', items: { type: 'object' } })
  categories?: Array<{
    id: number;
    name: string;
    imageUrl?: string | null;
  }>;
}

export class FindIngredientsByNamesDto {
  @IsArray()
  @IsString({ each: true })
  names: string[];
}

export class CreateIngredientDto {
  @ApiProperty({ description: 'Tên nguyên liệu', example: 'Thịt bò' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL hình ảnh nguyên liệu', example: 'https://example.com/beef.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Danh sách ID danh mục nguyên liệu', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  categoryIds: number[];

  @ApiProperty({ description: 'Flag để xác định xem có file ảnh mới được upload không', required: false })
  @IsOptional()
  @IsString()
  hasNewImageFile?: string;
}

export class UpdateIngredientDto {
  @ApiProperty({ description: 'UUID của nguyên liệu', example: 'd9b7b0e6-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Tên nguyên liệu', example: 'Thịt bò' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL hình ảnh nguyên liệu', example: 'https://example.com/beef.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Danh sách ID danh mục nguyên liệu', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  categoryIds: number[];

  @ApiProperty({ description: 'Flag để xác định xem có file ảnh mới được upload không', required: false })
  @IsOptional()
  @IsString()
  hasNewImageFile?: string;
}
