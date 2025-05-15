import { Controller, Post, Body, Req, UseGuards, Query, Delete, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
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

  @Post(':recipeId')
  @ApiOperation({ summary: 'Thêm công thức vào danh sách yêu thích' })
  @ApiResponse({ status: 201, description: 'Thêm thành công', type: ToggleFavoriteRecipeDto })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ hoặc công thức không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async addToFavorites(
    @Req() req,
    @Param('recipeId') recipeId: string,
  ): Promise<ToggleFavoriteRecipeDto> {
    return this.favoriteRecipeService.addToFavorites(req.user.id, { recipeId });
  }

  @Delete(':recipeId')
  @ApiOperation({ summary: 'Xóa công thức khỏi danh sách yêu thích' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ hoặc công thức không tồn tại trong yêu thích' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async removeFromFavorites(
    @Req() req,
    @Param('recipeId') recipeId: string,
  ): Promise<void> {
    return this.favoriteRecipeService.removeFromFavorites(req.user.id, { recipeId });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công thức yêu thích của người dùng' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang (mặc định: 10)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [ToggleFavoriteRecipeDto] })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getFavoriteRecipes(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: ToggleFavoriteRecipeDto[]; total: number }> {
    return this.favoriteRecipeService.getFavoriteRecipes(req.user.id, page, limit);
  }
}



