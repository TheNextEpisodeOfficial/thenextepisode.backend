import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { OrdPaymentController } from "./ordPayment.controller";
import { OrdPaymentService } from "./ordPayment.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrdPaymentEntity, OrdEntity])],
  controllers: [OrdPaymentController],
  providers: [OrdPaymentService],
})
export class OrdPaymentModule {}
