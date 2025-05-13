import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UnitOfMeasureService } from './unit_of_measure.service';
import { RolesGuard } from '../auth/guard/roles.guard';
import { AuthGuard } from '../auth/guard/auth.guard';
import {
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseUnitOfMeasureDto } from './unit_of_measure.dto';

@ApiTags('Units of Measure')
@Controller('units')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnitOfMeasureController {
  constructor(private readonly unitService: UnitOfMeasureService) {}

  @Get()
  @ApiOkResponse({ type: [ResponseUnitOfMeasureDto], description: 'Danh sách đơn vị đo lường' })
  getAllUnits(): Promise<ResponseUnitOfMeasureDto[]> {
    return this.unitService.getAllUnits();
  }
}
