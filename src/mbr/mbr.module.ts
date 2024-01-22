import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MbrEntity } from "./entities/mbr.entity";
import { MbrController } from "./mbr.controller";
import { MbrService } from "./mbr.service";

@Module({
  imports: [TypeOrmModule.forFeature([MbrEntity])],
  controllers: [MbrController],
  providers: [MbrService],
})
export class MbrModule {}
