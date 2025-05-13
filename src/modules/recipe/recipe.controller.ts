import { Controller, Get, Query, Param, ParseIntPipe, Req, Post, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { SearchRecipeQueryDto } from './recipe.dto';
import { ApiOperation, ApiQuery, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../auth/decorator/public.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RecipeLikeService } from '../recipe_like/recipe_like.service';
import { ToggleRecipeLikeDto } from '../recipe_like/recipe_like.dto';
import { FavoriteRecipeService } from '../favorite_recipe/favorite_recipe.service';
import { ToggleFavoriteRecipeDto } from '../favorite_recipe/favorite_recipe.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
}

@ApiTags('Recipes')
@Controller('recipes')
export class RecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly recipeLikeService: RecipeLikeService,
    private readonly favoriteRecipeService: FavoriteRecipeService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get("search")
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm công thức' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  async searchRecipes(@Query() queryDto: SearchRecipeQueryDto) {
    return this.recipeService.searchRecipes(queryDto);
  }

  @Get('banner')
  @Public()
  @ApiOperation({ summary: 'Lấy ngẫu nhiên một công thức công khai' })
  @ApiResponse({ status: 200, description: 'Trả về một công thức ngẫu nhiên' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức phù hợp' })
  async getBannerRecipe() {
    return this.recipeService.getRandomRecipe();
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Lấy 5 công thức phổ biến nhất' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về danh sách 5 công thức phổ biến nhất, được tính điểm dựa trên công thức: (số lượt xem * 0.5 + số lượt like * 2 + số lượt yêu thích * 3)' 
  })
  async getPopularRecipes(@Req() req: RequestWithUser) {
    const accountId = req.user?.id;
    return this.recipeService.getPopularRecipes(accountId);
  }

  @Get('category/:categoryId/top')
  @Public()
  @ApiOperation({ summary: 'Lấy 4 công thức nổi bật nhất theo danh mục' })
  @ApiParam({ name: 'categoryId', description: 'ID của danh mục' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về danh sách 4 công thức nổi bật nhất trong danh mục, được tính điểm dựa trên công thức: (số lượt xem * 0.5 + số lượt like * 2 + số lượt yêu thích * 3)' 
  })
  async getTopRecipesByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Req() req: RequestWithUser
  ) {
    const accountId = req.user?.id;
    return this.recipeService.getTopRecipesByCategory(categoryId, accountId);
  }

  @Get('detail/:id')
  @Public()
  @ApiOperation({ summary: 'Chi tiết công thức' })
  async getDetail(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('increaseView') increaseView?: string
  ) {
    // Tự trích xuất và xác thực token nếu có
    let accountId: string | undefined;
    let tokenStatus = 'none'; // none, valid, expired
    const authHeader = req.headers['authorization'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // Xác thực và giải mã token
        const decoded = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET')
        });
        accountId = decoded.sub;
        tokenStatus = 'valid';
      } catch (error) {
        // Token không hợp lệ hoặc hết hạn
        console.log('Error type:', error.constructor.name);
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        
        // Kiểm tra chi tiết hơn về lỗi
        if (error.name === 'TokenExpiredError' || error.message.includes('expired')) {
          tokenStatus = 'expired';
          console.log('Token status set to expired');
        } else {
          tokenStatus = 'invalid';
          console.log('Token status set to invalid');
        }
      }
    }
    
    const shouldIncreaseView = increaseView !== 'false';
    const recipe = await this.recipeService.getRecipeDetailForUser(id, accountId, shouldIncreaseView);
    
    console.log('Returning token status:', tokenStatus);
    
    return {
      message: 'Lấy chi tiết công thức thành công',
      data: recipe,
      tokenStatus
    };
  }

  @Post(':id/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Thích/bỏ thích công thức' })
  @ApiParam({ name: 'id', description: 'ID của công thức' })
  async toggleLike(
    @Param('id') id: string,
    @Req() req: RequestWithUser
  ) {
    if (!req.user) {
      throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
    }
    const dto: ToggleRecipeLikeDto = { recipeId: id };
    return this.recipeLikeService.toggleLike(req.user.id, dto);
  }

  @Post(':id/favorite')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Thêm/xóa công thức khỏi danh sách yêu thích' })
  @ApiParam({ name: 'id', description: 'ID của công thức' })
  async toggleFavorite(
    @Param('id') id: string,
    @Req() req: RequestWithUser
  ) {
    if (!req.user) {
      throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
    }
    const dto: ToggleFavoriteRecipeDto = { recipeId: id };
    return this.favoriteRecipeService.toggleFavorite(req.user.id, dto);
  }
}
