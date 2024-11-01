import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CelebService } from "@src/celeb/celeb.service";
import { CelebEntity } from "@src/celeb/entities/celeb.entity";

import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { MbrService } from "@src/mbr/mbr.service";
import { BttlOptRoleEntity } from "./entities/bttlOptRole.entity";
import { BttlOptRoleController } from "./bttlOptRole.controller";
import { MbrModule } from "@src/mbr/mbr.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CelebEntity, BttlOptRoleEntity]),
    MbrModule,
  ],
  controllers: [BttlOptRoleController],
  providers: [CelebService],
})
export class BttlOptRolebModule {}
