import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import { TcktService } from "@src/tckt/tckt.service";
import { OrdEntity } from "./entities/ord.entity";
import { OrdController } from "./ord.controller";
import { OrdService } from "./ord.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrdEntity, TcktEntity, OrdItemEntity])],
  controllers: [OrdController],
  providers: [OrdService, TcktService],
})
export class OrdModule {}
