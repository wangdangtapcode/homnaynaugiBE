import { Module } from "@nestjs/common";
import { UnitOfMeasure } from "./entities/unit_of_measure.entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudinaryModule } from "src/config/cloudinary/cloudinary.module";
import { AuthModule } from "../auth/auth.module";
import { Account } from "../account/entities/account.entities";
import { AdminUnitOfMeasureController } from "./admin_unit_of_measure.controller";
import { UnitOfMeasureService } from "./unit_of_measure.service";
import { UnitOfMeasureController } from "./unit_of_measure.controller";
@Module({
    imports: [
        TypeOrmModule.forFeature([UnitOfMeasure, Account]),
        AuthModule
    ],
    controllers: [ AdminUnitOfMeasureController, UnitOfMeasureController],
    providers: [UnitOfMeasureService],
    exports: [UnitOfMeasureService],
})
export class UnitOfMeasureModule{}