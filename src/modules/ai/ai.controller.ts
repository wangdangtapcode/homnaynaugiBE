import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, UseGuards, Req, Res, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Request } from 'express';

@ApiTags('AI')
@Controller('api')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract-ingredients')
  @ApiOperation({ summary: 'Trích xuất và tìm kiếm nguyên liệu từ hình ảnh' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Thành công trích xuất và tìm kiếm nguyên liệu' })
  @ApiResponse({ status: 400, description: 'Không thể xử lý hình ảnh' })
  @UseInterceptors(FileInterceptor('file'))
  async extractIngredientsFromImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    console.log('Request body:', req.body);
    console.log('File received:', file ? 'Yes, size: ' + file.size + ' bytes' : 'No file received');
    
    if (!file) {
      throw new BadRequestException('Hình ảnh không được trống');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Buffer hình ảnh không hợp lệ hoặc trống');
    }

    try {
      console.log('Processing image with size:', file.size, 'bytes');
      console.log('Buffer valid:', !!file.buffer, 'Buffer size:', file.buffer.length);
      
      const result = await this.aiService.extractAndFindIngredients(file.buffer);
      
      return { 
        ...result,
        originalImage: file.originalname
      };
    } catch (error) {
      console.error('Error during image processing:', error);
      throw new BadRequestException(`Lỗi khi xử lý nguyên liệu: ${error.message}`);
    }
  }
} 