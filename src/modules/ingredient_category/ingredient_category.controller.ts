import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { IngredientCategoryService } from './ingredient_category.service';
import { CreateIngredientCategoryDto } from './ingredient_category.dto';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';

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

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục nguyên liệu' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async findAll() {
    const categories = await this.ingredientCategoryService.findAll();
    return {
      message: 'Lấy danh sách thành công',
      data: categories,
    };
  }

  @Get(':id')
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
}
