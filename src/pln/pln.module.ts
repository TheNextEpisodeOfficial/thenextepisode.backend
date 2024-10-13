import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlnController } from "@src/pln/pln.controller";
import { PlnService } from "@src/pln/pln.service";

import { PlnEntity } from "@src/pln/entities/pln.entity";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { AdncOptEntity } from "../adncOpt/entities/adncOpt.entity";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import {AuthModule} from "@src/auth/auth.module";
import {MbrModule} from "@src/mbr/mbr.module";
import {BttlTeamEntity} from "@src/bttlTeam/entities/bttlTeam.entity";
import {BttlrEntity} from "@src/bttlr/entities/bttlr.entity";
import {AdncEntity} from "@src/adnc/entities/adnc.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlnEntity,
      BttlOptEntity,
      BttlOptRoleEntity,
      BttlTeamEntity,
      BttlrEntity,
      AdncOptEntity,
      AdncEntity,
      FileEntity,
      OrdItemEntity,
    ]),
    AuthModule,
    MbrModule
  ],
  controllers: [PlnController],
  providers: [PlnService],
})
export class PlnModule {}
