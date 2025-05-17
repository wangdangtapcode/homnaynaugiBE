import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { IngredientCategoryService } from './ingredient_category.service';
import { CreateIngredientCategoryDto } from './ingredient_category.dto';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';
import { Public } from '../auth/decorator/public.decorator';

@ApiTags('Ingredient Categories')
@Controller('ingredient-categories')
export class IngredientCategoryController {
  constructor(
    private readonly ingredientCategoryService: IngredientCategoryService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Tạo danh mục nguyên liệu mới' })
  @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Tên danh mục đã tồn tại' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createDto: CreateIngredientCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log("Dang tao danh muc nguyen lieu");
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      createDto.imageUrl = uploadResult.secure_url;
    }

    const category = await this.ingredientCategoryService.create(createDto);
    return {
      message: 'Tạo danh mục thành công',
      data: category,
    };
  }

  @Get("search")
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách danh mục nguyên liệu' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
  async findAll(
    @Query('query') query?: string,
    @Query('offset', ParseIntPipe) offset?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    const { data, total } = await this.ingredientCategoryService.findAll(query, offset, limit);
    return {
      message: 'Lấy danh sách thành công',
      data,
      total,
    };
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Lấy tất cả danh mục nguyên liệu không phân trang' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getAllCategories() {
    const { data } = await this.ingredientCategoryService.findAll(undefined, 0, 999);
    return {
      message: 'Lấy danh sách danh mục thành công',
      data
    };
  }

  @Get('search/:id')
  @ApiOperation({ summary: 'Lấy thông tin danh mục nguyên liệu' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const category = await this.ingredientCategoryService.findOne(id);
    return {
      message: 'Lấy thông tin thành công',
      data: category,
    };
  }

  @Put('edit/:id')
  @ApiOperation({ summary: 'Cập nhật danh mục nguyên liệu' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateIngredientCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      updateDto.imageUrl = uploadResult.secure_url;
    }

    const category = await this.ingredientCategoryService.update(id, updateDto);
    return {
      message: 'Cập nhật thành công',
      data: category,
    };
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Xóa danh mục nguyên liệu' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ingredientCategoryService.remove(id);
    return {
      message: 'Xóa danh mục thành công',
    };
  }

  // @Get()
  // async getAllIngredients(): Promise<CreateIngredientCategoryDto[]> {
  //   return this.ingredientCategoryService.getAllIngredients();
  // }
}
