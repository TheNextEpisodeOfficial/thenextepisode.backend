import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BttlOptnEntity } from "./entities/bttl.entity";
import { BttlController } from "./bttl.controller";
import { BttlService } from "./bttl.service";

@Module({
  imports: [TypeOrmModule.forFeature([BttlOptnEntity])],
  controllers: [BttlController],
  providers: [BttlService],
})
export class BttlModule {}
