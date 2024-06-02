import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { OrdPaymentController } from "./ordPayment.controller";
import { OrdPaymentService } from "./ordPayment.service";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import { TcktService } from "@src/tckt/tckt.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdPaymentEntity, OrdEntity, TcktEntity]),
  ],
  controllers: [OrdPaymentController],
  providers: [OrdPaymentService, TcktService],
})
export class OrdPaymentModule {}
