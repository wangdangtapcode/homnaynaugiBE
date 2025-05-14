import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FavoriteRecipeService } from './favorite_recipe.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { FavoriteRecipeResponseDto } from './favorite_recipe.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Favorite Recipes')
@ApiBearerAuth()
@Controller('favorite-recipes')
@UseGuards(AuthGuard)
export class FavoriteRecipeController {
  constructor(private readonly favoriteRecipesService: FavoriteRecipeService) {}

  @Post(':recipeId')
  @ApiOperation({ summary: 'Thêm công thức vào danh sách yêu thích' })
  @ApiParam({ name: 'recipeId', description: 'ID của công thức cần thêm vào yêu thích' })
  @ApiResponse({ status: 201, description: 'Thêm thành công', type: FavoriteRecipeResponseDto })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ hoặc công thức không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async addToFavorites(
    @Request() req,
    @Param('recipeId') recipeId: string,
  ): Promise<FavoriteRecipeResponseDto> {
    return this.favoriteRecipesService.addToFavorites(req.user.id, recipeId);
  }

  @Delete(':recipeId')
  @ApiOperation({ summary: 'Xóa công thức khỏi danh sách yêu thích' })
  @ApiParam({ name: 'recipeId', description: 'ID của công thức cần xóa khỏi yêu thích' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ hoặc công thức không tồn tại trong yêu thích' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async removeFromFavorites(
    @Request() req,
    @Param('recipeId') recipeId: string,
  ): Promise<void> {
    return this.favoriteRecipesService.removeFromFavorites(req.user.id, recipeId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công thức yêu thích của người dùng' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang (mặc định: 10)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [FavoriteRecipeResponseDto] })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getFavoriteRecipes(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: FavoriteRecipeResponseDto[]; total: number }> {
    return this.favoriteRecipesService.getFavoriteRecipes(req.user.id, page, limit);
  }

  @Get('me')
  @ApiOperation({ summary: 'Lấy danh sách công thức yêu thích của người dùng hiện tại' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang (mặc định: 10)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [FavoriteRecipeResponseDto] })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getMyFavoriteRecipes(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: FavoriteRecipeResponseDto[]; total: number }> {
    return this.favoriteRecipesService.getFavoriteRecipes(req.user.id, page, limit);
  }
}
