import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TcktEntity } from "./entities/tckt.entity";
import { TcktController } from "./tckt.controller";
import { TcktService } from "./tckt.service";
@Module({
  imports: [TypeOrmModule.forFeature([TcktEntity])],
  controllers: [TcktController],
  providers: [TcktService],
})
export class TcktModule {}
