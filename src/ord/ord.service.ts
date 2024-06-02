import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdncEntity } from "@src/adnc/entities/adnc.entity";
import { BttlrEntity } from "@src/bttlr/entities/bttlr.entity";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import {
  EntityManager,
  InsertResult,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { OrdEntity } from "./entities/ord.entity";
import { Response } from "@src/types/response";
import { TcktService } from "@src/tckt/tckt.service";

@Injectable()
export class OrdService {
  constructor(
    @InjectRepository(OrdEntity)
    private readonly ordEntity: Repository<OrdEntity>,
    private readonly entityManager: EntityManager,
    private readonly tcktService: TcktService
  ) {}

  /**
   * 주문 생성
   * @param ord - 주문 엔티티
   * @returns Promise<InsertResult>
   */
  async createOrd(ord: OrdEntity): Promise<InsertResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        const ordInsertResult = await this.insertOrder(entityManager, ord);
        const insertedOrd: ObjectLiteral = ordInsertResult.generatedMaps[0];

        await this.insertOrderItems(entityManager, ord, insertedOrd.id);

        await entityManager.query("COMMIT");
        if (ordInsertResult) {
          return ordInsertResult;
        }
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  }

  /**
   * 주문을 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param ord - 주문 엔티티
   * @returns Promise<InsertResult>
   */
  private async insertOrder(
    entityManager: EntityManager,
    ord: OrdEntity
  ): Promise<InsertResult> {
    return entityManager.insert(OrdEntity, {
      ...ord,
      ordMbrId: "15a6e7db-a719-47e3-9ee1-f881b24f02f7",
    });
  }

  /**
   * 주문 상품을 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param ord - 주문 엔티티
   * @param ordId - 주문 ID
   */
  private async insertOrderItems(
    entityManager: EntityManager,
    ord: OrdEntity,
    ordId: string
  ): Promise<void> {
    await Promise.all(
      ord.ordItem.map(async (item: OrdItemEntity) => {
        this.validateOrderItem(item);

        // S : 주문상품 데이터 생성
        await this.insertOrderItem(entityManager, item, ordId);
        // E : 주문상품 데이터 생성

        if (item.adncOptId) {
          await this.insertAdncEntity(entityManager, item);
        } else if (item.bttlOptId) {
          await this.insertBttlTeamAndBttlr(entityManager, item);
        }
      })
    );
  }

  /**
   * 주문 상품 유효성 검사
   * @param item - 주문 상품
   */
  private validateOrderItem(item: OrdItemEntity): void {
    if (!item.adncOptId && !item.bttlOptId) {
      throw new HttpException(
        "주문상품의 옵션 id는 필수입니다.",
        HttpStatus.BAD_REQUEST
      );
    }
    if (item.adncOptId && item.bttlOptId) {
      throw new HttpException(
        "주문상품의 옵션 id는 한가지 타입만 존재할 수 있습니다.",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * 단일 주문 상품을 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param item - 주문 상품
   * @param ordId - 주문 ID
   * @returns Promise<InsertResult>
   */
  private async insertOrderItem(
    entityManager: EntityManager,
    item: OrdItemEntity,
    ordId: string
  ): Promise<InsertResult> {
    const insertedOrdItem = entityManager.insert(OrdItemEntity, {
      ...item,
      ordId,
    });

    return insertedOrdItem;
  }

  /**
   * 관람객 엔티티를 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param item - 주문 상품
   */
  private async insertAdncEntity(
    entityManager: EntityManager,
    item: OrdItemEntity
  ): Promise<void> {
    // S : 관람객 Insert
    const adncInsertResult = await entityManager.insert(AdncEntity, {
      ...item.adnc[0],
      adncOptId: item.adncOptId,
    });
    // E : 관람객 Insert
    await this.tcktService.createTckt(entityManager, {
      ordItemId: item.id,
      adncId: adncInsertResult.generatedMaps[0].id,
    });
  }

  /**
   * 배틀 팀 및 배틀러 엔티티를 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param item - 주문 상품
   */
  private async insertBttlTeamAndBttlr(
    entityManager: EntityManager,
    item: OrdItemEntity
  ): Promise<void> {
    const bttlTeamInsertResult = await entityManager.insert(BttlTeamEntity, {
      ...item.bttlTeam,
      bttlOptId: item.bttlOptId,
    });

    if (!bttlTeamInsertResult) {
      throw new HttpException(
        "배틀 팀 등록에 실패하였습니다.",
        HttpStatus.BAD_REQUEST
      );
    }

    item.bttlTeam.bttlr.map(async (bttlr) => {
      // S : 배틀러 Insert
      const bttlrInsertResult = await entityManager.insert(BttlrEntity, bttlr);
      if (!bttlrInsertResult) {
        throw new HttpException(
          "배틀러 등록에 실패하였습니다.",
          HttpStatus.BAD_REQUEST
        );
      }
      // E : 배틀러 Insert

      // S : 배틀러 티켓 생성
      await this.tcktService.createTckt(entityManager, {
        ordItemId: item.id,
        bttlrId: bttlrInsertResult.generatedMaps[0].id,
      });
      // E : 배틀러 티켓 생성
    });
  }
}
