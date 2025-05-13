import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleRecipeLikeDto {
  @ApiProperty({
    description: 'ID của công thức cần thích/bỏ thích',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'ID công thức không được để trống' })
  @IsString({ message: 'ID công thức phải là chuỗi' })
  recipeId: string;
}
