import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional } from 'class-validator';

export class ResponseUnitOfMeasureDto {
  @ApiProperty({ example: 1, description: 'ID đơn vị đo' })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'gram', description: 'Tên của đơn vị đo (VD: gram, ml, kg)' })
  @IsString()
  unitName: string;

  @ApiProperty({ example: 'g', description: 'Ký hiệu của đơn vị đo (VD: g, ml)' ,required:false})
  @IsOptional()
  @IsString()
  symbol: string | null;
}
