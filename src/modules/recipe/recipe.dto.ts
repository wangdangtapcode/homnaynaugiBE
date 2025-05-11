import { IsOptional, IsString, IsNumber, Min, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeStatus } from './entities/recipe.entities';

export class SearchRecipeQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(RecipeStatus)
  status?: RecipeStatus;

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

export class RecipeResponseDto {
  id: string;
  name: string;
  status: RecipeStatus;
  imageUrl: string | null;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  createdAt: Date;
}

class RecipeIngredientDto {
  @IsString()
  ingredientId: string;

  @IsOptional()
  @IsNumber()
  quantity?: number | null;

  @IsOptional()
  @IsNumber()
  unitId?: number | null;
}

class CookingStepDto {
  @IsNumber()
  stepOrder: number;

  @IsString()
  instruction: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  carbohydrates?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  preparationTimeMinutes?: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsEnum(RecipeStatus)
  status: RecipeStatus;

  @IsArray()
  categoryIds: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CookingStepDto)
  steps: CookingStepDto[];
}
