import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import { TcktService } from "@src/tckt/tckt.service";
import { EntityManager, InsertResult, Repository } from "typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
@Injectable()
export class OrdPaymentService {
  constructor(
    @InjectRepository(OrdPaymentEntity)
    private readonly ordPaymentRepository: Repository<OrdPaymentEntity>,
    @InjectRepository(OrdEntity)
    private readonly ordRepository: Repository<OrdEntity>,
    private readonly entityManager: EntityManager,
    private readonly tcktService: TcktService
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
        const ordPaymentInsertResult = await entityManager.insert(
          OrdPaymentEntity,
          ordPayment
        );
        // E : 결제 INSERT

        // 결제 데이터 insert 완료 시
        if (ordPaymentInsertResult) {
          // S : 주문 상태 PAID로 변경
          await entityManager.update(
            OrdEntity,
            { id: ordPayment.orderId },
            { ordStt: "PAID" }
          );
          // E : 주문 상태 PAID로 변경

          // S : 주문 번호를 기준으로 주문 아이템들의 티켓 생성
          await this.tcktService.createTcktsByOrdId(ordPayment.orderId);
          // E : 주문 번호를 기준으로 주문 아이템들의 티켓 생성
        }

        return ordPaymentInsertResult;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  }
}
