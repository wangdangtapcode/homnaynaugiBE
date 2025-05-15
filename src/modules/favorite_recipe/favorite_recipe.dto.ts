import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

// DTO dùng cho đầu vào (add/remove/toggle yêu thích)
export class ToggleFavoriteRecipeDto {
  @ApiProperty({
    description: 'ID của công thức',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID công thức không được để trống' })
  recipeId: string;
}

export class AddFavoriteRecipeDto {
  @ApiProperty({
    description: 'ID của công thức cần thêm vào yêu thích',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID công thức không được để trống' })
  recipeId: string;
}

export class RemoveFavoriteRecipeDto {
  @ApiProperty({
    description: 'ID của công thức cần xóa khỏi yêu thích',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID công thức không được để trống' })
  recipeId: string;
}

// DTO con chứa thông tin tóm tắt về công thức
export class RecipeShortDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Gà chiên nước mắm' })
  name: string;

  @ApiProperty({ example: 'Món gà chiên thơm ngon đậm đà vị mắm' })
  description: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  image_url: string;

  @ApiProperty({ example: 30, description: 'Thời gian chuẩn bị (phút)' })
  prep_time: number;
}

// DTO trả về khi lấy danh sách hoặc thêm công thức yêu thích
export class FavoriteRecipeResponseDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ type: () => RecipeShortDto })
  recipe: RecipeShortDto;

  @ApiProperty({ example: '2025-05-14T12:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: true })
  is_active: boolean;
}