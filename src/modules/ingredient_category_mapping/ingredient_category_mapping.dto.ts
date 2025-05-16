import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

// ingredient-category.dto.ts
export class IngredientCategoryDto {
  id: number;
  name: string;
  imageUrl?: string | null;
}

// get-ingredients-by-category.dto.ts
export class GetIngredientsByCategoryDto {
  @IsInt()
  @Type(() => Number)
  categoryId: number;
}