import { HttpException, HttpStatus, Injectable, Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdncEntity } from "@src/adnc/entities/adnc.entity";
import { BttlrEntity } from "@src/bttlr/entities/bttlr.entity";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import {
  EntityManager,
  In,
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
import { getBttlOptTit } from "@src/util/system";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { AdncOptEntity } from "@src/adncOpt/entities/adncOpt.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";

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
  async createOrdTimer(mbrId): Promise<InsertResult> {
    return this.entityManager.insert(OrdTimerEntity, {
      createdBy: mbrId
    });
  }

  /**
   * 주문 시간 유효성 검사
   */
  async validateOrdTimer(timerId: string): Promise<boolean> {
    if (!timerId) {
      throw new HttpException(
        "올바르지 않은 접근입니다.",
        HttpStatus.FORBIDDEN
      );
    }

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
  }

  /**
   * 주문 재고 유효성 검사
   */
  async validateOrdStock(ord: OrdEntity): Promise<boolean> {
    const ordItems = ord.ordItem;
    for (const item of ordItems) {
      let option: AdncOptEntity | BttlOptEntity = null;
      let itemTit: string = "";

      if (item.adncOptId) {
        // 관람객 옵션
        option = await this.entityManager.findOne(AdncOptEntity, {
          where: { id: item.adncOptId },
        });
        itemTit = option.optNm;
      } else if (item.bttlOptId) {
        // 배틀 옵션
        option = await this.entityManager.findOne(BttlOptEntity, {
          where: { id: item.bttlOptId },
        });
        itemTit = getBttlOptTit(option);
      }

      // 최대 예매 가능수량과 현재 예매 숫자를 비교하여 재고가 부족한지 확인
      const maxRsvCnt: number = option.maxRsvCnt;
      const crntRsvCnt: number = option.crntRsvCnt;

      if (maxRsvCnt - crntRsvCnt < item.qty) {
        throw new HttpException(
          `${itemTit} 상품의 재고가 부족합니다.`,
          HttpStatus.BAD_REQUEST
        );
      }
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
    return entityManager.insert(OrdEntity, ord);
  }

  /**
   * 주문 상품을 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param ord - 주문 엔티티
   * @param ordId - 주문 ID
   * @param tcktHldMbrId
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
          ordId,
            ord.ordMbrId
        );
        const ordItemId = insertedOrdItem.generatedMaps[0].id;

        if (!ordItemId) {
          throw new HttpException(
            "주문상품 등록에 실패하였습니다.",
            HttpStatus.BAD_REQUEST
          );
        }

        if (item.adncOptId) {
          await this.insertAdncEntity(
            entityManager,
            item,
            ordItemId,
            ord.ordMbrId
          );
        } else if (item.bttlOptId) {
          await this.insertBttlTeamAndBttlr(
            entityManager,
            item,
            ordItemId,
            ord.ordMbrId
          );
        }

        // 재고 차감
        await entityManager.update(
          item.adncOptId ? AdncOptEntity : BttlOptEntity,
          {
            id: item.adncOptId ? item.adncOptId : item.bttlOptId,
          },
          {
            crntRsvCnt: () => `crnt_rsv_cnt + ${item.qty}`,
          }
        );
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
   * @param mbrId
   * @returns Promise<InsertResult>
   */
  private async insertOrderItem(
    entityManager: EntityManager,
    item: OrdItemEntity,
    ordId: string,
    mbrId: string
  ): Promise<InsertResult> {
    return entityManager.insert(OrdItemEntity, {
      ...item,
      ordId,
      createdBy: mbrId
    });
  }

  /**
   * 관람객 엔티티를 데이터베이스에 삽입
   * @param entityManager - 엔티티 매니저
   * @param item - 주문 상품
   * @param ordItemId - 주문상품 ID
   * @param tcktHldMbrId
   */
  private async insertAdncEntity(
    entityManager: EntityManager,
    item: OrdItemEntity,
    ordItemId: string,
    tcktHldMbrId: string
  ): Promise<void> {
    const adncEntities = Array.from({ length: item.qty }, () => ({
      ...item.adnc[0],
      adncOptId: item.adncOptId,
      createdBy: tcktHldMbrId
    }));

    const adncInsertResult = await entityManager.insert(
      AdncEntity,
      adncEntities
    );

    const adncIds = adncInsertResult.generatedMaps.map((map) => map.id);
    const tickets = adncIds.map((adncId) => ({
      ordItemId: ordItemId,
      adncId: adncId,
      tcktHldMbrId: tcktHldMbrId,
      createdBy: tcktHldMbrId
    }));

    await this.tcktService.createTcktBulk(entityManager, tickets);
  }

  /**
   * 배틀 팀 및 배틀러 엔티티를 데이터베이스에 삽입
   * @param entityManager
   * @param item
   * @param ordItemId
   * @param tcktHldMbrId
   */
  private async insertBttlTeamAndBttlr(
    entityManager: EntityManager,
    item: OrdItemEntity,
    ordItemId: string,
    tcktHldMbrId: string
  ): Promise<void> {
    const bttlTeamInsertResult = await entityManager.insert(BttlTeamEntity, {
      ...item.bttlTeam,
      bttlOptId: item.bttlOptId,
      createdBy: tcktHldMbrId
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
          createdBy: tcktHldMbrId
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
          tcktHldMbrId: tcktHldMbrId,
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

  async softDeleteOrd(ordId: string): Promise<boolean> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // 주문 엔티티 로드 및 논리삭제
        const order = await entityManager.findOneBy(OrdEntity, { id: ordId });
        if (order) {
          order.delYn = "Y";
          await entityManager.save(order); // save()를 사용하여 @BeforeUpdate 호출
        }

        // 주문 아이템 엔티티 로드 및 논리 삭제
        const ordItems = await entityManager.find(OrdItemEntity, {
          where: { ordId },
        });
        for (const item of ordItems) {
          item.delYn = "Y";
          await entityManager.save(item); // save()를 사용하여 @BeforeUpdate 호출
        }

        // 티켓 엔티티 로드 및 논리 삭제
        const tickets = await entityManager.find(TcktEntity, {
          where: { ordItemId: In(ordItems.map((i) => i.id)) },
        });
        const bttlrIds: string[] = [];
        const adncIds: string[] = [];

        for (const ticket of tickets) {
          ticket.delYn = "Y";
          await entityManager.save(ticket); // save()를 사용하여 @BeforeUpdate 호출

          if (ticket.bttlrId !== null) bttlrIds.push(ticket.bttlrId);
          if (ticket.adncId !== null) adncIds.push(ticket.adncId);
        }

        // 배틀러 엔티티 로드 및 논리 삭제
        if (bttlrIds.length) {
          const battlers = await entityManager.find(BttlrEntity, {
            where: { id: In(bttlrIds) },
          });
          for (const battler of battlers) {
            battler.delYn = "Y";
            await entityManager.save(battler); // save()를 사용하여 @BeforeUpdate 호출

            // 배틀 팀 아이디 수집
            const teamId = battler.bttlTeamId;
            if (teamId) {
              const team = await entityManager.findOneBy(BttlTeamEntity, {
                id: teamId,
              });
              if (team) {
                team.delYn = "Y";
                await entityManager.save(team); // save()를 사용하여 @BeforeUpdate 호출
              } else {
                await entityManager.query("ROLLBACK");
                throw new HttpException(
                  "배틀 팀이 존재하지 않습니다.",
                  HttpStatus.INTERNAL_SERVER_ERROR
                );
              }
            }
          }
        }

        // 관람객 엔티티 로드 및 논리 삭제
        if (adncIds.length) {
          const audience = await entityManager.find(AdncEntity, {
            where: { id: In(adncIds) },
          });
          for (const aud of audience) {
            aud.delYn = "Y";
            await entityManager.save(aud); // save()를 사용하여 @BeforeUpdate 호출
          }
        }

        return true;
      } catch (error) {
        await entityManager.query("ROLLBACK");
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  }
}
