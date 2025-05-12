import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guard/auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { UnitOfMeasure } from "./entities/unit_of_measure.entities";
import { ResponseUnitOfMeasureDto } from "./unit_of_measure.dto";
import { UnitOfMeasureService } from "./unit_of_measure.service";


@ApiTags('Admin/Unit Of Measure')
@Controller('admin/unit-of-measure')
@UseGuards(AuthGuard,RolesGuard)
@ApiBearerAuth()
export class AdminUnitOfMeasureController {
    constructor(private readonly unitOfMeasureService:UnitOfMeasureService){}


    @Get('all')
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
