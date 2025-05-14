import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// DTO con: Thông tin công thức trong danh sách yêu thích
export class RecipeInFavoriteDto {
  @ApiProperty({ description: 'ID của công thức' })
  id: string;

  @ApiProperty({ description: 'Tên công thức' })
  name: string;

  @ApiProperty({ description: 'Mô tả công thức', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'URL ảnh công thức', nullable: true })
  image_url: string | null;

  @ApiProperty({ description: 'Thời gian chuẩn bị (phút)', nullable: true })
  prep_time: number | null;
}

// DTO cho response khi lấy thông tin yêu thích
export class FavoriteRecipeResponseDto {
  @ApiProperty({ description: 'ID của bản ghi yêu thích' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Thông tin công thức', type: () => RecipeInFavoriteDto })
  @Type(() => RecipeInFavoriteDto)
  recipe: RecipeInFavoriteDto;

  @ApiProperty({ description: 'Thời gian tạo' })
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({ description: 'Trạng thái hoạt động' })
  @IsBoolean()
  is_active: boolean;
}

// DTO cho request khi thêm công thức vào yêu thích
export class AddFavoriteRecipeDto {
  @ApiProperty({ description: 'ID của công thức cần thêm vào yêu thích' })
  @IsNumber()
  recipeId: number;
}

// DTO cho request khi xóa công thức khỏi yêu thích
export class RemoveFavoriteRecipeDto {
  @ApiProperty({ description: 'ID của công thức cần xóa khỏi yêu thích' })
  @IsNumber()
  recipeId: number;
}
