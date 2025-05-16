import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ViewHistoryDto {
  @ApiPropertyOptional({ description: 'ID người dùng (nếu có)', type: 'string', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  account_id?: string;

  @ApiProperty({ description: 'ID công thức đã xem', type: 'string', format: 'uuid' })
  @IsUUID()
  recipe_id: string;
}