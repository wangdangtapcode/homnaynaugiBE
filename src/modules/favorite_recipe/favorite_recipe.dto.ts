import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ToggleFavoriteRecipeDto {
  @ApiProperty({
    description: 'ID của công thức',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty({ message: 'ID công thức không được để trống' })
  recipeId: string;
}
