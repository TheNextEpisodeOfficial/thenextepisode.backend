import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MbrEntity } from "./entities/mbr.entity";
import { MbrController } from "./mbr.controller";
import { MbrService } from "./mbr.service";
import { MbrLogEntity } from "./entities/mbrLog.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MbrEntity, MbrLogEntity])],
  controllers: [MbrController],
  providers: [MbrService],
  exports: [MbrService],
})
export class MbrModule {}
