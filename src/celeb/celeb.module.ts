import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CelebEntity } from "./entities/celeb.entity";
import { CelebController } from "./celeb.controller";
import { CelebService } from "./celeb.service";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { MbrService } from "@src/mbr/mbr.service";

@Module({
  imports: [TypeOrmModule.forFeature([CelebEntity, MbrEntity])],
  controllers: [CelebController],
  providers: [CelebService, MbrService],
})
export class CelebModule {}
