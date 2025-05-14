import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guard/auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { UnitOfMeasure } from "./entities/unit_of_measure.entities";
import { ResponseUnitOfMeasureDto } from "./unit_of_measure.dto";
import { UnitOfMeasureService } from "./unit_of_measure.service";
import { Public } from "../auth/decorator/public.decorator";


@ApiTags('Unit Of Measure')
@Controller('unit-of-measure')
export class UnitOfMeasureController {
    constructor(private readonly unitOfMeasureService:UnitOfMeasureService){}


    @Get('all')
    @Public()
@ApiResponse({
  status: 200,
  description: 'Danh sách đơn vị đo',
  type: ResponseUnitOfMeasureDto,
  isArray: true,
})
async findAll(): Promise<ResponseUnitOfMeasureDto[]> {
  const units = await this.unitOfMeasureService.findAll();
  return units.map((unit) => ({
    id: unit.id,
    unitName: unit.unitName,
    symbol: unit.symbol,
  }));
}
}
