import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import { EntityManager, InsertResult, Repository } from "typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
@Injectable()
export class OrdPaymentService {
  constructor(
    @InjectRepository(OrdPaymentEntity)
    private readonly ordPaymentRepository: Repository<OrdPaymentEntity>,
    @InjectRepository(OrdEntity)
    private readonly ordRepository: Repository<OrdEntity>,
    @InjectRepository(TcktEntity)
    private readonly tcktRepository: Repository<TcktEntity>,
    private readonly entityManager: EntityManager
  ) {}

  /**
   * 결제 완료 데이터 생성
   * @param ordPayment
   * @returns
   */
  createOrdPayment(ordPayment: OrdPaymentEntity): Promise<InsertResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // S : 결제 INSERT
        const ordInsertResult = await entityManager.insert(
          OrdPaymentEntity,
          ordPayment
        );
        // E : 결제 INSERT

        return ordInsertResult;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  }
}
