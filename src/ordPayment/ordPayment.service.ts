import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import { EntityManager, InsertResult, Repository } from "typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
@Injectable()
export class OrdPaymentService {
  constructor(
    @InjectRepository(OrdPaymentEntity)
    private readonly ordPaymentRepository: Repository<OrdPaymentEntity>,
    @InjectRepository(OrdPaymentEntity)
    private readonly tcktRepository: Repository<TcktEntity>,
    private readonly entityManager: EntityManager
  ) {}

  createPayment(ordPayment: OrdPaymentEntity): Promise<InsertResult> {
    return this.entityManager.transaction(async (entityManager) => {
      // S : 결제 INSERT
      try {
        const ordInsertResult = await entityManager.insert(
          OrdPaymentEntity,
          ordPayment
        );
        return ordInsertResult;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // E : 결제 INSERT
    });
  }
}
