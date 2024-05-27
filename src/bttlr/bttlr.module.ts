import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BttlrController } from "./bttlr.controller";
import { BttlrService } from "./bttlr.service";
import { BttlrEntity } from "./entities/bttlr.entity";
@Module({
  imports: [TypeOrmModule.forFeature([BttlrEntity])],
  controllers: [BttlrController],
  providers: [BttlrService],
})
export class BttlrModule {}
