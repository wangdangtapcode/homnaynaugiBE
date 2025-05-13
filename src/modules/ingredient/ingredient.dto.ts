import { IsOptional, IsString, IsNumber, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
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


  // id: string;
  // name: string;
  // imageUrl: string | null;
  // categories: {
  //   id: number;
  //   name: string;
  //   imageUrl: string | null;
  // }[];
}

export class FindIngredientsByNamesDto {
  @IsArray()
  @IsString({ each: true })
  names: string[];
}
