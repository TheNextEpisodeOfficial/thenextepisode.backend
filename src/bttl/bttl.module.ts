import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BttlOptEntity } from "./entities/bttlOpt.entity";
import { BttlController } from "./bttl.controller";
import { BttlService } from "./bttl.service";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BttlOptEntity, BttlOptRoleEntity])],
  controllers: [BttlController],
  providers: [BttlService],
})
export class BttlModule {}
