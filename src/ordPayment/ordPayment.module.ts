import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { OrdPaymentController } from "./ordPayment.controller";
import { OrdPaymentService } from "./ordPayment.service";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import { TcktService } from "@src/tckt/tckt.service";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import {AuthModule} from "@src/auth/auth.module";
import {MbrEntity} from "@src/mbr/entities/mbr.entity";
import {MbrModule} from "@src/mbr/mbr.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdPaymentEntity,
      OrdEntity,
      TcktEntity,
      OrdItemEntity,
    ]),
    MbrModule,
    AuthModule
  ],
  controllers: [OrdPaymentController],
  providers: [OrdPaymentService, TcktService],
})
export class OrdPaymentModule {}
