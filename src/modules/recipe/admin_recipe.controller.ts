import { Controller, Post, Body, UseGuards, Get, Query, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, SearchRecipeQueryDto } from './recipe.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleName } from '../role/enum/role.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';

@ApiTags('Admin/Recipes')
@Controller('admin/recipes')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminRecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post("create")
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tạo mới công thức (Admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  async createRecipe(
    @Body() dto: CreateRecipeDto,
    @Request() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {

    console.log("DANG TAO CONG THUC MOI")
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
    return this.recipeService.createRecipe(dto, req.user.id);
  }

  @Get("search")
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tìm kiếm công thức' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái công thức' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  async searchRecipes(@Query() queryDto: SearchRecipeQueryDto) {
    return this.recipeService.searchRecipes(queryDto);
  }
}
