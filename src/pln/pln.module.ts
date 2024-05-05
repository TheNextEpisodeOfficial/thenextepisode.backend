import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlnController } from "@src/pln/pln.controller";
import { PlnService } from "@src/pln/pln.service";

import { PlnEntity } from "@src/pln/entities/pln.entity";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { AdncOptEntity } from "../adncOpt/entities/adncOpt.entity";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlnEntity,
      BttlOptEntity,
      BttlOptRoleEntity,
      AdncOptEntity,
      FileEntity,
    ]),
  ],
  controllers: [PlnController],
  providers: [PlnService],
})
export class PlnModule {}
