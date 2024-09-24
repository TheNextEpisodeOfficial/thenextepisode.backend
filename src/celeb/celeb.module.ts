import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CelebEntity } from "./entities/celeb.entity";
import { CelebController } from "./celeb.controller";
import { CelebService } from "./celeb.service";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { MbrService } from "@src/mbr/mbr.service";
import { MbrModule } from "@src/mbr/mbr.module";

@Module({
  imports: [TypeOrmModule.forFeature([CelebEntity]), MbrModule],
  controllers: [CelebController],
  providers: [CelebService],
  exports: [CelebService],
})
export class CelebModule {}
