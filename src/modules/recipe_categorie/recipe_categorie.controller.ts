import { Controller, UseInterceptors, Post, UploadedFile, Get , Body, ParseIntPipe, Query, Param, Put, Delete, } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RecipeCategoryService } from "./recipe_categorie.service";
import { CloudinaryService } from "src/config/cloudinary/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateRecipeCategoryDto } from "./recipe_categorie.dto";
import { Public } from "../auth/decorator/public.decorator";
import { RecipeCategory } from "./entities/recipe_categorie.entities";

@ApiTags('Recipe Categories')
@Controller('recipe-categories')
export class RecipeCategoryController{
    constructor(
        private readonly recipeCategoryService: RecipeCategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ){}

    @Get("search")
    @Public()
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
  
    @Get('search/:id')
    @Public()
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

    @Get('random')
    @Public()
    @ApiOperation({ summary: 'Lấy ngẫu nhiên 6 danh mục món ăn' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    async getRandomCategories() {
      const categories = await this.recipeCategoryService.getRandomCategories();
      return {
        message: 'Lấy danh sách thành công',
        data: categories,
      };
    }

    @Get()
    @ApiOperation({ summary: 'Lấy tất cả danh mục món ăn' })
    async getAllCategories(): Promise<RecipeCategory[]> {
      return this.recipeCategoryService.getAllCategories();
    }
}
