import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FavoriteRecipeService } from './favorite_recipe.service';
import { ToggleFavoriteRecipeDto } from './favorite_recipe.dto';
import { Request } from 'express';
import { AuthGuard } from '../auth/guard/auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Favorite Recipes')
@Controller('favorite-recipes')
@UseGuards(AuthGuard) // Yêu cầu đăng nhập để sử dụng API
export class FavoriteRecipeController {
  constructor(private readonly favoriteRecipeService: FavoriteRecipeService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Thêm/xóa công thức khỏi danh sách yêu thích' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thêm/xóa thành công',
    schema: {
      properties: {
        message: { type: 'string' },
        isFavorite: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  async toggleFavorite(
    @Req() req: RequestWithUser,
    @Body() dto: ToggleFavoriteRecipeDto
  ) {
    return this.favoriteRecipeService.toggleFavorite(req.user.id, dto);
  }
}
