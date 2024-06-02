import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BttlrEntity } from "@src/bttlr/entities/bttlr.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { randomUUID } from "crypto";
import { EntityManager, Repository } from "typeorm";
import { TcktEntity } from "./entities/tckt.entity";
@Injectable()
export class TcktService {
  constructor(
    @InjectRepository(TcktEntity)
    private readonly tcktRepository: Repository<TcktEntity>,
    @InjectRepository(OrdItemEntity)
    private readonly ordItemRepository: Repository<OrdItemEntity>
  ) {}
  /**
   * 티켓 생성
   * @param entityManager
   * @param item
   */
  async createTckt(
    entityManager: EntityManager,
    info: {
      ordItemId: string;
      bttlrId?: string;
      adncId?: string;
    }
  ): Promise<void> {
    const secretKey = randomUUID();
    await entityManager.insert(TcktEntity, {
      ordItemId: info.ordItemId,
      bttlrId: info.bttlrId,
      adncId: info.adncId,
      tcktHldMbrId: "15a6e7db-a719-47e3-9ee1-f881b24f02f7",
      secretKey: secretKey,
    });
  }

  /**
   * 주문번호를 기준으로 생성된 티켓의 상태를 결제완료로 변경한다.
   * @param entityManager
   * @param ordId
   */
  async setTcktSttPaidByOrdId(entityManager: EntityManager, ordId: string) {
    const orderItems = await entityManager.find(OrdItemEntity, {
      where: {
        ordId: ordId,
      },
    });

    orderItems.map(async (ordItem) => {
      await entityManager.update(
        TcktEntity,
        { ordItemId: ordItem.id },
        { tcktStt: "PAID" }
      );
    });
  }

  /**
   * 멤버 아이디를 기준으로 보유중인 티켓을 가져온다.
   */
  async getMyTckts(mbrId: string) {
    this.tcktRepository.find({
      where: {
        tcktHldMbrId: mbrId,
        tcktStt: "PAID",
      },
    });
  }
}
