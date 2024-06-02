import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { Repository } from "typeorm";
@Injectable()
export class TcktService {
  constructor(
    @InjectRepository(OrdItemEntity)
    private readonly ordItemRepository: Repository<OrdItemEntity>
  ) {}

  /**
   * 주문 번호를 기준으로 주문 아이템들의 티켓 생성
   * @param ordId
   */
  async createTcktsByOrdId(ordId: string) {}
}
