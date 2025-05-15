import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ViewHistoryService } from './view_history.service';
import { ViewHistoryDto } from './view_history.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('View History')
@Controller('view-history')
export class ViewHistoryController {
  constructor(private readonly viewHistoryService: ViewHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo lịch sử xem mới' })
  @ApiBody({ type: ViewHistoryDto })
  async create(@Body() createDto: ViewHistoryDto) {
    return this.viewHistoryService.create(createDto);
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Lấy lịch sử xem theo accountId' })
  @ApiParam({ name: 'accountId', description: 'ID người dùng', type: 'string' })
  async findByAccount(@Param('accountId', new ParseUUIDPipe()) accountId: string) {
    return this.viewHistoryService.findByAccountId(accountId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ lịch sử xem' })
  async findAll() {
    return this.viewHistoryService.findAll();
  }
}
