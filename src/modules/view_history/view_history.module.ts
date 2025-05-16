import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewHistory } from './entities/view_history.entities';
import { ViewHistoryService } from './view_history.service';
import { ViewHistoryController } from './view_history.controller';
import { Recipe } from '../recipe/entities/recipe.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ViewHistory, Recipe])],
  controllers: [ViewHistoryController], 
  providers: [ViewHistoryService],
})
export class ViewHistoryModule {}