import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UnitOfMeasure } from './entities/unit_of_measure.entities';
import { UnitOfMeasureResponseDto } from './unit_of_measure.dto';
import { UnitOfMeasureService } from './unit_of_measure.service';
import { RolesGuard } from '../auth/guard/roles.guard';
import { AuthGuard } from '../auth/guard/auth.guard';
import {
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Units of Measure')
@Controller('units')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnitOfMeasureController {
  constructor(private readonly unitService: UnitOfMeasureService) {}

  @Get()
  @ApiOkResponse({ type: [UnitOfMeasureResponseDto], description: 'Danh sách đơn vị đo lường' })
  getAllUnits(): Promise<UnitOfMeasureResponseDto[]> {
    return this.unitService.getAllUnits();
  }
}
