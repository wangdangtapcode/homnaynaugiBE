import { Controller, Get, Query, Param, ParseIntPipe, Req, Post, UseGuards, UseInterceptors, UploadedFiles, Body, Put } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, SearchRecipeQueryDto, UpdateRecipeDto } from './recipe.dto';
import { ApiOperation, ApiQuery, ApiTags, ApiParam, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../auth/decorator/public.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RecipeLikeService } from '../recipe_like/recipe_like.service';
import { ToggleRecipeLikeDto } from '../recipe_like/recipe_like.dto';
import { FavoriteRecipeService } from '../favorite_recipe/favorite_recipe.service';
import { ToggleFavoriteRecipeDto } from '../favorite_recipe/favorite_recipe.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Recipe } from './entities/recipe.entities';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';

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
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // @Get("search")
  // @Public()
  // @ApiOperation({ summary: 'Tìm kiếm công thức' })
  // @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  // @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức' })
  // @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  // @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  // async searchRecipes(@Query() queryDto: SearchRecipeQueryDto) {
  //   return this.recipeService.searchRecipes(queryDto);
  // }

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
  
  @Get("recipeFeed")
  @Public()
  @ApiOperation({ summary: 'Hiển thị công thức món ăn'})
  @ApiQuery({ name: 'sortBy', required: false, description: 'Cách sắp xếp: newest, views, likes, favorites, recommended' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả trả về' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu (dùng cho infinite scroll)' })
  async getRecipeFeed(
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.recipeService.getRecipeFeed({sortBy, limit, offset});
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

  @Get('top-favorites')
  async getTopFavoriteRecipes(
    @Query('limit') limit?: number,
  ): Promise<Recipe[]> {
    const recipeLimit = limit && +limit > 0 ? +limit : 5;
    return this.recipeService.getTopFavoriteRecipes(recipeLimit);
  }

  @Post("create")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Tạo mới công thức (User)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  async createRecipe(
    @Body() dto: CreateRecipeDto,
    @Req() req: RequestWithUser,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {

    console.log('--- NESTJS CONTROLLER ---');
    console.log('Received CreateRecipeDto:', JSON.stringify(dto, null, 2));
    console.log('Received Files:', files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size })));
    console.log('-------------------------');
    let currentFileIndex = 0;
    
    // Upload recipe image if hasNewRecipeImageFile is true
    if (dto.hasNewRecipeImageFile && files && files.length > currentFileIndex) {
      const recipeImage = files[currentFileIndex];
      const uploadResult = await this.cloudinaryService.uploadImage(recipeImage);
      dto.imageUrl = uploadResult.secure_url;
      currentFileIndex++;
    }

    // Upload step images if there are more files
    if (files && files.length > currentFileIndex && dto.steps) {
      // Lặp qua từng bước và kiểm tra hasNewImageFile
      for (let i = 0; i < dto.steps.length; i++) {
        const step = dto.steps[i];
        if (step.hasNewImageFile && currentFileIndex < files.length) {
          const stepImageResult = await this.cloudinaryService.uploadImage(files[currentFileIndex]);
          dto.steps[i].imageUrl = stepImageResult.secure_url;
          currentFileIndex++;
        }
      }
    }
    console.log("XONG BUOC UP FILE LEN CLOUD")
    if (!req.user) {
      throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
    }
    return this.recipeService.createRecipe(dto, req.user.id);
  }

  @Put("update")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cập nhật công thức (User)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  async updateRecipe(
    @Body() dto: UpdateRecipeDto,
    @Req() req: RequestWithUser,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log('--- NESTJS CONTROLLER UPDATE ---');
    console.log('Received UpdateRecipeDto:', JSON.stringify(dto, null, 2));
    console.log('Received Files:', files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size })));
    console.log('-------------------------');

    if (!req.user) {
      throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
    }

    if (!dto.id) {
      throw new Error('ID công thức là bắt buộc cho việc cập nhật');
    }

    // Kiểm tra quyền sở hữu công thức
    const recipe = await this.recipeService.getRecipeById(dto.id);
    if (!recipe) {
      throw new Error('Không tìm thấy công thức');
    }

    if (recipe.accountId !== req.user.id) {
      throw new Error('Bạn không có quyền cập nhật công thức này');
    }

    let currentFileIndex = 0;
    
    // Upload recipe image if hasNewRecipeImageFile is true
    if (dto.hasNewRecipeImageFile && files && files.length > currentFileIndex) {
      const recipeImage = files[currentFileIndex];
      const uploadResult = await this.cloudinaryService.uploadImage(recipeImage);
      dto.imageUrl = uploadResult.secure_url;
      currentFileIndex++;
    }

    // Upload step images if there are more files
    if (files && files.length > currentFileIndex && dto.steps) {
      // Lặp qua từng bước và kiểm tra hasNewImageFile
      for (let i = 0; i < dto.steps.length; i++) {
        const step = dto.steps[i];
        if (step.hasNewImageFile && currentFileIndex < files.length) {
          const stepImageResult = await this.cloudinaryService.uploadImage(files[currentFileIndex]);
          dto.steps[i].imageUrl = stepImageResult.secure_url;
          currentFileIndex++;
        }
      }
    }

    console.log("XONG BUOC UP FILE LEN CLOUD")
    return this.recipeService.updateRecipe(dto, req.user.id);
  }
}
