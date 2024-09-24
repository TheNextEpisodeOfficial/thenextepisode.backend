import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MbrEntity } from "./entities/mbr.entity";
import { MbrController } from "./mbr.controller";
import { MbrService } from "./mbr.service";
import { MbrLogEntity } from "./entities/mbrLog.entity";
import { AuthModule } from "@src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([MbrEntity, MbrLogEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [MbrController],
  providers: [MbrService],
  exports: [MbrService],
})
export class MbrModule {}
