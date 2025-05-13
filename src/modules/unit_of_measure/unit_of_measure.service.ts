import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitOfMeasure } from './entities/unit_of_measure.entities';
import { UnitOfMeasureResponseDto } from './unit_of_measure.dto';

@Injectable()
export class UnitOfMeasureService {
  constructor(
    @InjectRepository(UnitOfMeasure)
    private readonly unitOfMeasureRepository: Repository<UnitOfMeasure>,
  ) {}

  async findAll(): Promise<UnitOfMeasure[]> {
    return this.unitOfMeasureRepository.find();
  }

  async findOne(id: number): Promise<UnitOfMeasure> {
    const unit = await this.unitOfMeasureRepository.findOneBy({ id });
    if (!unit) {
      throw new NotFoundException(`UnitOfMeasure with ID "${id}" not found`);
    }
    return unit;
  }

  async getAllUnits(): Promise<UnitOfMeasureResponseDto[]> {
    const units = await this.unitOfMeasureRepository.find();

    return units.map((unit) => ({
      id: unit.id,
      unitName: unit.unitName,
      symbol: unit.symbol,
    }));
  }
}