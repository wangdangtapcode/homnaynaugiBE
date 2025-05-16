import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticService } from './statistic.service';
import { OverviewStatisticDto, TimelineStatisticDto, TimeRange, StatisticType, SortBy, TopRecipesResponseDto } from './statistic.dto';

@ApiTags('statistics')
@Controller('admin/statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan cho Admin Dashboard' })
  @ApiOkResponse({ 
    description: 'Trả về thống kê tổng quan',
    type: OverviewStatisticDto 
  })
  async getOverviewStatistics(): Promise<OverviewStatisticDto> {
    return this.statisticService.getOverviewStatistics();
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Lấy dữ liệu thống kê theo thời gian cho biểu đồ' })
  @ApiQuery({ name: 'type', enum: StatisticType, description: 'Loại dữ liệu thống kê' })
  @ApiQuery({ name: 'range', enum: TimeRange, description: 'Khoảng thời gian' })
  @ApiOkResponse({
    description: 'Trả về dữ liệu thống kê theo thời gian',
    type: TimelineStatisticDto
  })
  async getTimelineStatistics(
    @Query('type') type: StatisticType = StatisticType.VIEWS,
    @Query('range') range: TimeRange = TimeRange.WEEK,
  ): Promise<TimelineStatisticDto> {
    return this.statisticService.getTimelineStatistics(type, range);
  }

  @Get('top-recipes')
  @ApiOperation({ summary: 'Lấy danh sách món ăn nổi bật theo lượt xem hoặc lượt thích' })
  @ApiQuery({ name: 'limit', description: 'Số lượng món ăn trả về', required: false })
  @ApiQuery({ name: 'sortBy', enum: SortBy, description: 'Sắp xếp theo tiêu chí', required: false })
  @ApiQuery({ name: 'range', enum: TimeRange, description: 'Khoảng thời gian', required: false })
  @ApiOkResponse({
    description: 'Trả về danh sách món ăn nổi bật',
    type: TopRecipesResponseDto
  })
  async getTopRecipes(
    @Query('limit') limit: number = 5,
    @Query('sortBy') sortBy: SortBy = SortBy.VIEWS,
    @Query('range') range: TimeRange = TimeRange.WEEK,
  ): Promise<TopRecipesResponseDto> {
    return this.statisticService.getTopRecipes(limit, sortBy, range);
  }
}
