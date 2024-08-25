import { HttpException, HttpStatus, Injectable, Req } from "@nestjs/common";
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
  UpdateResult,
} from "typeorm";
import { OrdEntity } from "./entities/ord.entity";
import { TcktService } from "@src/tckt/tckt.service";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { SrchOrdListDto } from "./dtos/ord.dto";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { OrdTimerEntity } from "@src/ord/entities/ordTimer.entity";
import dayjs from "dayjs";

@Injectable()
export class OrdService {
  constructor(
    @InjectRepository(OrdEntity)
    private readonly ordRepository: Repository<OrdEntity>,
    private readonly entityManager: EntityManager,
    private readonly tcktService: TcktService
  ) {}

  /**
   * 주문 타이머 생성
   */
  async createOrdTimer(): Promise<InsertResult> {
    return this.entityManager.insert(OrdTimerEntity, {});
  }

  /**
   * 주문 시간 유효성 검사
   */
  async validateOrdTimer(timerId: string): Promise<boolean> {
    const timer = await this.entityManager.findOne(OrdTimerEntity, {
      where: { id: timerId },
      select: ["id", "createdAt"], // 필요한 컬럼을 명시적으로 선택
    });

    if (timer) {
      const createdAt = dayjs(timer.createdAt);
      const currentTime = dayjs();

      const timeDifference = currentTime.diff(createdAt, "minute"); // 시간 차이를 분 단위로 계산

      if (timeDifference <= 10) {
        return true;
      } else {
        throw new HttpException(
          "타이머가 유효하지 않습니다. 10분이 초과되었습니다.",
          HttpStatus.REQUEST_TIMEOUT
        );
      }
    } else {
      throw new HttpException(
        "올바르지 않은 접근입니다.",
        HttpStatus.FORBIDDEN
      );
    }

    return true;
  }

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
    const adncEntities = Array.from({ length: item.qty }, () => ({
      ...item.adnc[0],
      adncOptId: item.adncOptId,
    }));

    const adncInsertResult = await entityManager.insert(
      AdncEntity,
      adncEntities
    );

    const adncIds = adncInsertResult.generatedMaps.map((map) => map.id);
    const tickets = adncIds.map((adncId) => ({
      ordItemId: ordItemId,
      adncId: adncId,
    }));

    await this.tcktService.createTcktBulk(entityManager, tickets);
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
    const queryBuilder = this.ordRepository
      .createQueryBuilder("ord")
      .select("ord.id")
      .where("ord.ordMbrId = :mbrId", { mbrId: srchOrdListDto.mbrId })
      .andWhere("ord.ordStt = 'PAID'")
      .orderBy("ord.createdAt", "DESC");

    const ordIdsPaginated = await paginate<{ id: string }>(
      queryBuilder,
      srchOrdListDto
    );

    if (!ordIdsPaginated.items.length) {
      return new Pagination<OrdEntity>([], ordIdsPaginated.meta);
    }

    const fullQueryBuilder = this.ordRepository
      .createQueryBuilder("ord")
      // S : 주문 결제 정보
      .leftJoin("ord.ordPayment", "ordPayment")
      .addSelect([
        "ordPayment.id",
        "ordPayment.orderName",
        "ordPayment.method",
        "ordPayment.paymentTypeCd",
        "ordPayment.discountAmount",
        "ordPayment.totalAmount",
        "ordPayment.currency",
        "ordPayment.easyProvider",
        "ordPayment.cardType",
        "ordPayment.cardNumber",
        "ordPayment.receiptUrl",
        "ordPayment.createdAt",
        "ordPayment.cardIssuerCode",
      ])
      // E : 주문 결제 정보
      // S : 주문 상품 정보
      .leftJoin("ord.ordItem", "ordItem")
      .addSelect([
        "ordItem.ordAmt",
        "ordItem.payAmt",
        "ordItem.dscntAmt",
        "ordItem.qty",
        "ordItem.claimYn",
        "ordItem.claimAmt",
        "ordItem.sort",
      ])
      // E : 주문 상품 정보
      // S : 배틀 옵션 정보
      .leftJoin("ordItem.bttlOpt", "bttlOpt")
      .addSelect([
        "bttlOpt.bttlGnrCd",
        "bttlOpt.bttlRule",
        "bttlOpt.bttlMbrCnt",
        "bttlOpt.mxdYn",
        "bttlOpt.bttlRsvFee",
        "bttlOpt.freeYn",
        "bttlOpt.sort",
      ])
      // E : 배틀 옵션 정보
      .leftJoin("ordItem.adncOpt", "adncOpt")
      .addSelect([
        "adncOpt.optNm",
        "adncOpt.optFee",
        "adncOpt.freeYn",
        "adncOpt.sort",
      ])
      // S : 플랜 정보
      .leftJoinAndMapOne(
        "ordItem.pln",
        PlnEntity,
        "pln",
        "pln.id = COALESCE(bttlOpt.plnId, adncOpt.plnId)"
      )
      // E : 플랜 정보
      .leftJoinAndMapOne(
        "pln.file",
        FileEntity,
        "file",
        "file.fileGrpId = pln.fileGrpId AND file.fileTypeCd = 'THMB_MN'"
      )
      .addSelect(["file.fileNm"])
      .where("ord.id IN (:...ids)", {
        ids: ordIdsPaginated.items.map((item) => item.id),
      })
      .andWhere("ord.ordStt = 'PAID'")
      .orderBy("ord.createdAt", "DESC");

    const ordList = await fullQueryBuilder.getMany();

    return new Pagination<OrdEntity>(ordList, ordIdsPaginated.meta);
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

  /**
   * 주문 삭제
   * @param ordId - 주문 ID
   * @returns Promise<UpdateResult>
   */
  async deleteOrd(ordId: string): Promise<UpdateResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        const softDeleteResult = await entityManager.update(
          OrdEntity,
          {
            id: ordId,
          },
          {
            delYn: "Y",
          }
        );
        return softDeleteResult;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  }
}
