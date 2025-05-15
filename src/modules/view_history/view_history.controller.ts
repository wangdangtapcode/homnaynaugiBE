import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ViewHistoryService } from './view_history.service';
import { ViewHistoryDto } from './view_history.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('View History')
@Controller('view-history')
export class ViewHistoryController {
  constructor(private readonly viewHistoryService: ViewHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hoặc cập nhật lịch sử xem' })
  @ApiBody({ type: ViewHistoryDto })
  @ApiResponse({ status: 201, description: 'Lịch sử xem được tạo hoặc cập nhật thành công' })
  async createOrUpdate(@Body() createDto: ViewHistoryDto) {
    return this.viewHistoryService.createOrUpdate(createDto);
  }


  @Get('account/:accountId')
  @ApiOperation({ summary: 'Lấy lịch sử xem theo accountId' })
  @ApiParam({
    name: 'accountId',
    description: 'UUID người dùng',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch sử xem của người dùng',
  })
  async findByAccount(
    @Param('accountId', new ParseUUIDPipe()) accountId: string,
  ) {
    return this.viewHistoryService.findByAccountId(accountId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ lịch sử xem' })
  @ApiResponse({ status: 200, description: 'Danh sách toàn bộ lịch sử xem' })
  async findAll() {
    return this.viewHistoryService.findAll();
  }

  @Get('created-by')
async findRecipesCreatedBy(
  @Query('accountId', new ParseUUIDPipe({ optional: true })) accountId?: string,
) {
  if (!accountId) {
    return []; // hoặc có thể return thông báo lỗi
  }
  return this.viewHistoryService.findRecipesCreatedBy(accountId);
}

}