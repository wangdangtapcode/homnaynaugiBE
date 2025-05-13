import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecipeLikeService } from './recipe_like.service';
import { ToggleRecipeLikeDto } from './recipe_like.dto';
import { Request } from 'express';
import { AuthGuard } from '../auth/guard/auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Recipe Likes')
@Controller('recipe-likes')
@UseGuards(AuthGuard) // Yêu cầu đăng nhập để sử dụng API
export class RecipeLikeController {
  constructor(private readonly recipeLikeService: RecipeLikeService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Thích/bỏ thích công thức' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thích/bỏ thích thành công',
    schema: {
      properties: {
        message: { type: 'string' },
        isLiked: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  async toggleLike(
    @Req() req: RequestWithUser,
    @Body() dto: ToggleRecipeLikeDto
  ) {
    return this.recipeLikeService.toggleLike(req.user.id, dto);
  }
}
