import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdncController } from "./adnc.controller";
import { AdncService } from "./adnc.service";
import { AdncEntity } from "./entities/adnc.entity";
@Module({
  imports: [TypeOrmModule.forFeature([AdncEntity])],
  controllers: [AdncController],
  providers: [AdncService],
})
export class AdncModule {}
