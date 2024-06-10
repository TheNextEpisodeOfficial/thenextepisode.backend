import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { TcktEntity } from "./entities/tckt.entity";
import { TcktController } from "./tckt.controller";
import { TcktService } from "./tckt.service";
@Module({
  imports: [TypeOrmModule.forFeature([TcktEntity, OrdItemEntity])],
  controllers: [TcktController],
  providers: [TcktService],
})
export class TcktModule {}
