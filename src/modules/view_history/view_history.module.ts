import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewHistory } from './entities/view_history.entities';
import { ViewHistoryService } from './view_history.service';
import { ViewHistoryController } from './view_history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ViewHistory])],
  controllers: [ViewHistoryController], // ✅ phải có
  providers: [ViewHistoryService],
})
export class ViewHistoryModule {}
