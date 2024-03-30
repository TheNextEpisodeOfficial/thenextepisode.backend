import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlnController } from "@src/pln/pln.controller";
import { PlnService } from "@src/pln/pln.service";

import { PlnEntity } from "@src/pln/entities/pln.entity";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PlnEntity, BttlOptEntity])],
  controllers: [PlnController],
  providers: [PlnService],
})
export class PlnModule {}
