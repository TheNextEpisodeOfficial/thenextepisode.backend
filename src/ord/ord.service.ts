import { HttpException, HttpStatus, Injectable, Req } from "@nestjs/common";
import { Request } from "express";
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
import { TcktService } from "@src/tckt/tckt.service";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { SrchOrdListDto } from "./dtos/ord.dto";
import { SessionData } from "express-session";

@Injectable()
export class OrdService {
  constructor(
    @InjectRepository(OrdEntity)
    private readonly ordRepository: Repository<OrdEntity>,
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

        return ordInsertResult;
      } catch (error) {
        await entityManager.query("ROLLBACK");
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

        const insertedOrdItem = await this.insertOrderItem(
          entityManager,
          item,
          ordId
        );
        const ordItemId = insertedOrdItem.generatedMaps[0].id;

        if (!ordItemId) {
          throw new HttpException(
            "주문상품 등록에 실패하였습니다.",
            HttpStatus.BAD_REQUEST
          );
        }

        if (item.adncOptId) {
          await this.insertAdncEntity(entityManager, item, ordItemId);
        } else if (item.bttlOptId) {
          await this.insertBttlTeamAndBttlr(entityManager, item, ordItemId);
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
    return entityManager.insert(OrdItemEntity, {
      ...item,
      ordId,
    });
  }

  /**
   * 관람객 엔티티를 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param item - 주문 상품
   * @param ordItemId - 주문상품 ID
   */
  private async insertAdncEntity(
    entityManager: EntityManager,
    item: OrdItemEntity,
    ordItemId: string
  ): Promise<void> {
    const adncInsertResult = await entityManager.insert(AdncEntity, {
      ...item.adnc[0],
      adncOptId: item.adncOptId,
    });

    await this.tcktService.createTckt(entityManager, {
      ordItemId: ordItemId,
      adncId: adncInsertResult.generatedMaps[0].id,
    });
  }

  /**
   * 배틀 팀 및 배틀러 엔티티를 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param item - 주문 상품
   * @param ordItemId - 주문상품 ID
   */
  private async insertBttlTeamAndBttlr(
    entityManager: EntityManager,
    item: OrdItemEntity,
    ordItemId: string
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

    await Promise.all(
      item.bttlTeam.bttlr.map(async (bttlr) => {
        const bttlrInsertResult = await entityManager.insert(BttlrEntity, {
          ...bttlr,
          bttlTeamId: bttlTeamInsertResult.generatedMaps[0].id,
        });

        if (!bttlrInsertResult) {
          throw new HttpException(
            "배틀러 등록에 실패하였습니다.",
            HttpStatus.BAD_REQUEST
          );
        }

        await this.tcktService.createTckt(entityManager, {
          ordItemId: ordItemId,
          bttlrId: bttlrInsertResult.generatedMaps[0].id,
        });
      })
    );
  }

  /**
   * 주문 결제 리스트 조회
   * @returns Promise<OrdEntity[]>
   */
  async getOrdList(
    srchOrdListDto: SrchOrdListDto
  ): Promise<Pagination<OrdEntity>> {
    const queryBuilder = this.ordRepository.createQueryBuilder("ord");

    queryBuilder
      .leftJoinAndSelect("ord.ordPayment", "ordPayment")
      .where("ord.ordMbrId = :mbrId", {
        mbrId: srchOrdListDto.mbrId,
      })
      .andWhere("ord.ordStt = 'PAID'")
      .andWhere("ordPayment.orderId = ord.id")
      .select([
        "ord.id",
        "ord.ordMbrId",
        "ord.totalOrdAmt",
        "ord.totalPayAmt",
        "ord.totalDscntAmt",

        "ordPayment.orderName",
        "ordPayment.method",
        "ordPayment.easyProvider",
        "ordPayment.orderNum",
        "ordPayment.receiptUrl",
      ]);

    try {
      const ordList = await paginate<OrdEntity>(queryBuilder, srchOrdListDto);
      return ordList;
    } catch (error) {
      throw new HttpException(
        "주문 리스트 검색 중 오류가 발생했습니다.",
        HttpStatus.FORBIDDEN,
        { cause: error }
      );
    }
  }

  /**
   * 주문 결제 상세 조회
   * @returns Promise<OrdEntity[]>
   */
  async getOrdDtlById(ordId: string): Promise<OrdEntity> {
    console.log("ordId:", ordId);
    const ordDtlResult = await this.ordRepository
      .createQueryBuilder("ord")
      .leftJoinAndSelect("ord.ordPayment", "ordPayment")
      .leftJoinAndSelect("ord.ordItem", "ordItem")
      .where("ord.id = :ordId", { ordId: ordId })
      .andWhere("ord.ordStt = 'PAID'")
      .getOne();

    if (ordDtlResult) {
      return ordDtlResult;
    } else {
      throw new HttpException(
        "주문이 존재하지 않습니다.",
        HttpStatus.NOT_FOUND
      );
    }
  }
}
