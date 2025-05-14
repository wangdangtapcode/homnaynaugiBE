import { Controller, Post, Body, UseGuards, Get, Query, Request, UseInterceptors, UploadedFiles, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, SearchRecipeQueryDto, UpdateRecipeDto } from './recipe.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleName } from '../role/enum/role.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
    return this.recipeService.searchRecipesForAdmin(queryDto);
  }
  @Get('get-recipe/:id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết công thức' })
  @ApiParam({ name: 'id', description: 'ID của công thức' })
  async getRecipeById(@Param('id') id: string) {
    return this.recipeService.getRecipeById(id);
  }

  @Get('detail/:id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Chi tiết công thức' })
  async getDetail(@Param('id') id: string) {
    const recipe = await this.recipeService.findByIdWithStats(id);
  
  
    return {
      message: 'Lấy chi tiết công thức thành công',
      data: recipe,
    };
  }
  @Delete('delete/:id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Xóa công thức' })
  async deleteRecipe(@Param('id') id: string) {
    return this.recipeService.deleteRecipe(id);
  }

  @Put("update")
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Cập nhật công thức (Admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  async updateRecipe(
    @Body() dto: UpdateRecipeDto,
    @Request() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log('--- NESTJS CONTROLLER ---');
    console.log('Received UpdateRecipeDto:', JSON.stringify(dto, null, 2));
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
    return this.recipeService.updateRecipe(dto, req.user.id);
  }
}
