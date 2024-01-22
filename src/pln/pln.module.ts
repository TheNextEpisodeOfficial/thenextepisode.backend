import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlnController } from "@src/pln/pln.controller";
import { PlnService } from "@src/pln/pln.service";

import { PlnEntity } from "@src/pln/entities/pln.entity";
import { MODULE_CONFIG } from "@src/config/constants/constants";

@Module({
  imports: [TypeOrmModule.forFeature([PlnEntity])],
  controllers: [PlnController],
  providers: [PlnService],
})
export class PlnModule {}
