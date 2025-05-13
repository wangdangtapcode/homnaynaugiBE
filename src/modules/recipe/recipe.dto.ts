import { IsOptional, IsString, IsNumber, Min, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
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

  @IsOptional()
  @IsString()
  keyword?: string;
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
  @Type(() => Number)
  quantity?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitId?: number | null;
}

class CookingStepDto {
  @IsNumber()
  @Type(()=>Number)
  stepOrder: number;

  @IsString()
  instruction: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsBoolean() // Hoặc @IsBooleanString() nếu từ FormData
  @Type(() => Boolean) // Để transform 'true'/'false' thành boolean
  hasNewImageFile?: boolean;
}

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  protein?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  carbohydrates?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasNewRecipeImageFile?: boolean;
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  preparationTimeMinutes?: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsEnum(RecipeStatus)
  status: RecipeStatus;

  @IsArray()
  @IsNumber({}, { each: true }) // Đảm bảo mỗi phần tử là số sau khi transform
  @Type(() => Number)
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

export class UpdateRecipeDto extends CreateRecipeDto {
  @IsOptional()
  @IsString()
  id: string;
}
