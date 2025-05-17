import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe, NotFoundException
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleName } from '../role/enum/role.enum';
import { UpdateUserProfileDto } from './user_profile.dto';
import { UserProfileService } from './user_profile.service';
import { FavoriteRecipeService } from '../favorite_recipe/favorite_recipe.service';
import { RecipeService } from '../recipe/recipe.service';
import { ViewHistoryService } from '../view_history/view_history.service';

@ApiTags('Admin/User-Profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@Controller('admin/user-profiles')
export class AdminUserProfileController {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly favoriteRecipeService: FavoriteRecipeService,
    private readonly recipeService: RecipeService,
    private readonly viewHistoryService: ViewHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả hồ sơ người dùng' })
  async findAll() {
    return {
      message: 'Lấy danh sách hồ sơ người dùng thành công',
      data: await this.userProfileService.findAllProfiles(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy hồ sơ người dùng theo ID' })
  async findOne(@Param('id') id: string) {
    return {
      message: 'Lấy hồ sơ người dùng thành công',
      data: await this.userProfileService.findProfileById(id),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật hồ sơ người dùng theo ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserProfileDto) {
    return {
      message: 'Cập nhật hồ sơ người dùng thành công',
      data: await this.userProfileService.adminUpdateUserProfile(id, dto),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá hồ sơ người dùng' })
  async remove(@Param('id') id: string) {
    await this.userProfileService.deleteUserProfile(id);
    return { message: 'Xoá hồ sơ người dùng thành công' };
  }

  @Get(':accountId/details')
  @ApiOperation({ summary: 'Lấy chi tiết user kèm công thức yêu thích, công thức tạo, lịch sử xem' })
  @ApiParam({ name: 'accountId', description: 'UUID của user' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @ApiResponse({ status: 400, description: 'accountId không hợp lệ' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async getUserDetails(@Param('accountId', new ParseUUIDPipe()) accountId: string) {
    const profile = await this.userProfileService.getProfile(accountId);
    if (!profile) {
      throw new NotFoundException(`User với accountId ${accountId} không tồn tại`);
    }

    const favoriteRecipes = await this.favoriteRecipeService.getFavoriteRecipes(accountId, 1, 50);
    const myRecipes = await this.recipeService.searchRecipesMe({ accountId, offset: 0, limit: 50 });
    const viewHistory = await this.viewHistoryService.findByAccountId(accountId);

    return {
      message: 'Lấy dữ liệu chi tiết người dùng thành công',
      data: {
        profile,
        favoriteRecipes: favoriteRecipes.data || [],
        myRecipes: myRecipes || [],
        viewHistory: viewHistory || [],
      },
    };
  }
}
