import { Controller, UseInterceptors, Post, UploadedFile, Get , Body, ParseIntPipe, Query, Param, Put, Delete, } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RecipeCategoryService } from "./recipe_categorie.service";
import { CloudinaryService } from "src/config/cloudinary/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateRecipeCategoryDto } from "./recipe_categorie.dto";



@ApiTags('Recipe Categories')
@Controller('recipe-categories')
export class RecipeCategoryController{
    constructor(
        private readonly recipeCategoryService: RecipeCategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ){}

    @Post('create')
    @ApiOperation({ summary: 'Tạo danh mục món ăn mới' })
    @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Tên danh mục đã tồn tại' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    async create(
      @Body() createDto: CreateRecipeCategoryDto,
      @UploadedFile() file?: Express.Multer.File,
    ) {
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        createDto.imageUrl = uploadResult.secure_url;
      }
  
      const category = await this.recipeCategoryService.create(createDto);
      return {
        message: 'Tạo danh mục thành công',
        data: category,
      };
    }
  
    @Get()
    @ApiOperation({ summary: 'Lấy danh sách danh mục món ăn' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm' })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả' })
    async findAll(
      @Query('query') query?: string,
      @Query('offset', ParseIntPipe) offset?: number,
      @Query('limit', ParseIntPipe) limit?: number,
    ) {
      const { data, total } = await this.recipeCategoryService.findAll(query, offset, limit);
      return {
        message: 'Lấy danh sách thành công',
        data,
        total,
      };
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin danh mục món ăn' })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      const category = await this.recipeCategoryService.findOne(id);
      return {
        message: 'Lấy thông tin thành công',
        data: category,
      };
    }
  
    @Put('edit/:id')
    @ApiOperation({ summary: 'Cập nhật danh mục món ăn' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: CreateRecipeCategoryDto,
      @UploadedFile() file?: Express.Multer.File,
    ) {
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        updateDto.imageUrl = uploadResult.secure_url;
      }
  
      const category = await this.recipeCategoryService.update(id, updateDto);
      return {
        message: 'Cập nhật thành công',
        data: category,
      };
    }
  
    @Delete('delete/:id')
    @ApiOperation({ summary: 'Xóa danh mục món ăn' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
    async remove(@Param('id', ParseIntPipe) id: number) {
      await this.recipeCategoryService.remove(id);
      return {
        message: 'Xóa danh mục thành công',
      };
    }
}
