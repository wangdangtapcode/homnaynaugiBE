import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { IngredientService } from '../ingredient/ingredient.service';
import { SearchIngredientQueryDto, CreateIngredientDto, UpdateIngredientDto } from './ingredient.dto';
import { RoleName } from '../role/enum/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';

@ApiTags('Admin/Ingredients')
@Controller('admin/ingredients')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminIngredientController {
  constructor(
    private readonly ingredientService: IngredientService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get('search')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tìm kiếm nguyên liệu' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  @ApiQuery({ name: 'categoryIds', required: false, description: 'ID danh mục' })
  async searchIngredients(@Query() queryDto: SearchIngredientQueryDto) {
    return this.ingredientService.searchIngredients(queryDto);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của nguyên liệu' })
  @ApiParam({ name: 'id', description: 'ID của nguyên liệu' })
  async getIngredientById(@Param('id') id: string) {
    const ingredient = await this.ingredientService.getIngredientById(id);
    return {
      message: 'Lấy thông tin nguyên liệu thành công',
      data: ingredient
    };
  }

  @Post('create')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tạo nguyên liệu mới' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async createIngredient(
    @Body() createDto: CreateIngredientDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    console.log('Received createIngredient request:');
    console.log('DTO:', JSON.stringify(createDto));
    console.log('File received:', file ? 'Yes' : 'No');
    
    try {
      // Upload file to cloudinary if it exists
      if (file && createDto.hasNewImageFile) {
        console.log('Uploading file to Cloudinary...');
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        createDto.imageUrl = uploadResult.secure_url;
        console.log('File uploaded successfully, URL:', createDto.imageUrl);
      }

      console.log('Creating ingredient with category IDs:', createDto.categoryIds);
      const ingredient = await this.ingredientService.createIngredient(createDto);
      
      return {
        message: 'Tạo nguyên liệu thành công',
        data: ingredient
      };
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  }

  @Put('update')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Cập nhật nguyên liệu' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async updateIngredient(
    @Body() updateDto: UpdateIngredientDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    console.log('Received updateIngredient request:');
    console.log('DTO:', JSON.stringify(updateDto));
    console.log('File received:', file ? 'Yes' : 'No');
    
    try {
      // Upload file to cloudinary if it exists
      if (file && updateDto.hasNewImageFile) {
        console.log('Uploading file to Cloudinary...');
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        updateDto.imageUrl = uploadResult.secure_url;
        console.log('File uploaded successfully, URL:', updateDto.imageUrl);
      }

      console.log('Updating ingredient with category IDs:', updateDto.categoryIds);
      const ingredient = await this.ingredientService.updateIngredient(updateDto);
      
      return {
        message: 'Cập nhật nguyên liệu thành công',
        data: ingredient
      };
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Xóa nguyên liệu' })
  @ApiParam({ name: 'id', description: 'ID của nguyên liệu' })
  async deleteIngredient(@Param('id') id: string) {
    await this.ingredientService.deleteIngredient(id);
    return {
      message: 'Xóa nguyên liệu thành công'
    };
  }
}
