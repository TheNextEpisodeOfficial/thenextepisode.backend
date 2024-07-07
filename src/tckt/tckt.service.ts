import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BttlrEntity } from "@src/bttlr/entities/bttlr.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { randomUUID } from "crypto";
import { EntityManager, Repository } from "typeorm";
import { TcktEntity } from "./entities/tckt.entity";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { TicketListDto } from "./dtos/tckt.dto";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { getBttlOptTit } from "@src/util/system";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";
import { plainToInstance } from "class-transformer";
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

    // Promise.all을 사용하여 모든 업데이트 작업을 병렬로 처리
    await Promise.all(
      orderItems.map((ordItem) =>
        entityManager.update(
          TcktEntity,
          { ordItemId: ordItem.id },
          { tcktStt: "PAID" }
        )
      )
    );
  }
  /**
   * 멤버 아이디를 기준으로 보유중인 티켓 리스트를 가져온다.
   */
  async getMyTckts(mbrId: string): Promise<TicketListDto[]> {
    const queryBuilder = this.tcktRepository
      .createQueryBuilder("tckt")
      .leftJoinAndSelect("tckt.ordItem", "ordItem")
      .leftJoinAndSelect("tckt.bttlr", "bttlr")
      .leftJoinAndSelect("tckt.adnc", "adnc")
      .leftJoinAndSelect("ordItem.bttlOpt", "bttlOpt")
      .leftJoinAndSelect("ordItem.adncOpt", "adncOpt")
      .leftJoinAndMapOne(
        "bttl_team",
        BttlTeamEntity,
        "bttlTeam",
        "bttlTeam.id = bttlr.bttlTeamId"
      )
      .leftJoinAndMapOne(
        "ordItem.pln",
        PlnEntity,
        "pln",
        "pln.id = COALESCE(bttlOpt.plnId, adncOpt.plnId)"
      )
      .leftJoinAndMapOne(
        "s3_file",
        FileEntity,
        "file",
        "file.fileGrpId = pln.fileGrpId"
      );

    queryBuilder.select([
      'tckt.id AS "tcktId"',
      'tckt.teamAsgnYn AS "teamAsgnYn"',
      'tckt.hndOvrYn AS "hndOvrYn"',
      'tckt.usedYn AS "usedYn"',
      'ordItem.id AS "ordItemId"',
      'ordItem.bttlOptId AS "bttlOptId"',
      'ordItem.adncOptId AS "adncOptId"',

      'bttlOpt.bttlGnrCd AS "bttlGnrCd"',
      'bttlOpt.bttlRule AS "bttlRule"',
      'bttlOpt.bttlMbrCnt AS "bttlMbrCnt"',

      'bttlTeam.bttlTeamNm AS "bttlTeamNm"',

      'adncOpt.optNm AS "adncOptNm"',

      'bttlr.id AS "bttlrId"',
      'bttlr.bttlrNm AS "bttlrNm"',
      'bttlr.bttlrDncrNm AS "bttlrDncrNm"',
      'bttlr.bttlrBirth AS "bttlrBirth"',
      'bttlr.bttlrPhn AS "bttlrPhn"',
      'adnc.adncNm AS "adncNm"',
      'pln.plnNm AS "plnNm"',
      'pln.plnRoadAddr AS "plnRoadAddr"',
      'pln.plnAddrDtl AS "plnAddrDtl"',
      'pln.plnDt AS "plnDt"',
      'file.fileNm AS "tcktThumb"',
    ]);

    // queryBuilder.where("tckt.tcktHldMbrId = :mbrId", { mbrId });
    queryBuilder.where("tckt.tcktHldMbrId = :mbrId", {
      mbrId: "15a6e7db-a719-47e3-9ee1-f881b24f02f7",
    });
    queryBuilder.andWhere("tckt.tcktStt = :tcktStt", { tcktStt: "PAID" });
    queryBuilder.andWhere("file.fileTypeCd = 'THMB_MN'");

    const rawResults = await queryBuilder.getRawMany();

    const ticketList = plainToInstance(
      TicketListDto,
      rawResults.map((result) => ({
        ...result,
        optTit: result.adncOptNm
          ? result.adncOptNm
          : getBttlOptTit({
              bttlGnrCd: result.bttlGnrCd,
              bttlRule: result.bttlRule,
              bttlMbrCnt: result.bttlMbrCnt,
            }),
      }))
    );

    return ticketList;
  }

  /**
   * 티켓 아이디를 기준으로 티켓 상세정보를 가져온다.
   */
  async getTcktDtlById(tcktId: string): Promise<TicketListDto> {
    const queryBuilder = this.tcktRepository
      .createQueryBuilder("tckt")
      .leftJoinAndSelect("tckt.ordItem", "ordItem")
      .leftJoinAndSelect("tckt.bttlr", "bttlr")
      .leftJoinAndSelect("tckt.adnc", "adnc")
      .leftJoinAndSelect("ordItem.bttlOpt", "bttlOpt")
      .leftJoinAndSelect("ordItem.adncOpt", "adncOpt")
      .leftJoinAndMapOne(
        "bttl_team",
        BttlTeamEntity,
        "bttlTeam",
        "bttlTeam.id = bttlr.bttlTeamId"
      )
      .leftJoinAndMapOne(
        "ordItem.pln",
        PlnEntity,
        "pln",
        "pln.id = COALESCE(bttlOpt.plnId, adncOpt.plnId)"
      )
      .leftJoinAndMapOne(
        "s3_file",
        FileEntity,
        "file",
        "file.fileGrpId = pln.fileGrpId"
      );

    queryBuilder.select([
      'tckt.id AS "tcktId"',
      'tckt.teamAsgnYn AS "teamAsgnYn"',
      'tckt.hndOvrYn AS "hndOvrYn"',
      'tckt.usedYn AS "usedYn"',
      'ordItem.id AS "ordItemId"',
      'ordItem.bttlOptId AS "bttlOptId"',
      'ordItem.adncOptId AS "adncOptId"',

      'bttlOpt.bttlGnrCd AS "bttlGnrCd"',
      'bttlOpt.bttlRule AS "bttlRule"',
      'bttlOpt.bttlMbrCnt AS "bttlMbrCnt"',

      'bttlTeam.bttlTeamNm AS "bttlTeamNm"',

      'adncOpt.optNm AS "adncOptNm"',

      'bttlr.id AS "bttlrId"',
      'bttlr.bttlrNm AS "bttlrNm"',
      'bttlr.bttlrDncrNm AS "bttlrDncrNm"',
      'bttlr.bttlrBirth AS "bttlrBirth"',
      'bttlr.bttlrPhn AS "bttlrPhn"',
      'adnc.adncNm AS "adncNm"',
      'pln.plnNm AS "plnNm"',
      'pln.plnRoadAddr AS "plnRoadAddr"',
      'pln.plnAddrDtl AS "plnAddrDtl"',
      'pln.plnDt AS "plnDt"',
      'file.fileNm AS "tcktThumb"',
    ]);

    queryBuilder.where("tckt.id = :tcktId", {
      tcktId: tcktId,
    });
    queryBuilder.andWhere("tckt.tcktStt = :tcktStt", { tcktStt: "PAID" });
    queryBuilder.andWhere("file.fileTypeCd = 'THMB_MN'");

    const rawResult = await queryBuilder.getRawOne();

    if (rawResult) {
      rawResult.optTit = rawResult.adncOptNm
        ? rawResult.adncOptNm
        : getBttlOptTit({
            bttlGnrCd: rawResult.bttlGnrCd,
            bttlRule: rawResult.bttlRule,
            bttlMbrCnt: rawResult.bttlMbrCnt,
          });
      const ticketList = plainToInstance(TicketListDto, rawResult);
      return ticketList;
    } else {
      throw new HttpException(
        "존재하지 않는 티켓입니다.",
        HttpStatus.NOT_FOUND
      );
    }
  }

  async useTcktById(tcktId: string) {
    try {
      const ticketInfo = await this.tcktRepository.findOne({
        where: { id: tcktId },
      });
      if (ticketInfo.usedYn === "Y") {
        throw new HttpException(
          "이미 사용처리된 티켓입니다.",
          HttpStatus.CONFLICT
        );
      } else if (ticketInfo.delYn === "Y") {
        throw new HttpException(
          "사용할 수 없는 티켓입니다.",
          HttpStatus.FORBIDDEN
        );
      }
      return this.tcktRepository.update({ id: tcktId }, { usedYn: "Y" });
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
