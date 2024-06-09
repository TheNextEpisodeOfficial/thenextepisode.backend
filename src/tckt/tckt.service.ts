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
      "tckt.id",
      "tckt.teamAsgnYn AS team_asgn_yn",
      "tckt.hndOvrYn AS hnd_ovr_yn",
      "tckt.usedYn AS used_yn",
      "ordItem.id",
      "ordItem.bttlOptId AS bttl_opt_id",
      "ordItem.adncOptId AS adnc_opt_id",

      "bttlOpt.bttlGnrCd AS bttl_gnr_cd",
      "bttlOpt.bttlRule AS bttl_rule",
      "bttlOpt.bttlMbrCnt AS bttl_mbr_cnt",

      "bttlTeam.bttlTeamNm AS bttl_team_nm",

      "adncOpt.optNm AS adnc_opt_nm",

      "bttlr.id",
      "bttlr.bttlrNm AS bttlr_nm",
      "bttlr.bttlrDncrNm AS bttlr_dncr_nm",
      "bttlr.bttlrBirth AS bttlr_birth",
      "bttlr.bttlrPhn AS bttlr_phn",
      "adnc.adncNm AS adnc_nm",
      "pln.plnNm as pln_nm",
      "pln.plnRoadAddr as pln_road_addr",
      "pln.plnAddrDtl as pln_addr_dtl",
      "pln.plnDt as pln_dt",
      "file.fileNm as tckt_thumb",
    ]);

    // queryBuilder.where("tckt.tcktHldMbrId = :mbrId", { mbrId });
    queryBuilder.where("tckt.tcktHldMbrId = :mbrId", {
      mbrId: "15a6e7db-a719-47e3-9ee1-f881b24f02f7",
    });
    queryBuilder.andWhere("tckt.tcktStt = :tcktStt", { tcktStt: "PAID" });
    queryBuilder.andWhere("file.fileTypeCd = 'THMB_MN'");

    const rawResults = await queryBuilder.getRawMany();

    const ticketList: TicketListDto[] = rawResults.map((result) => ({
      tcktId: result.tckt_id,
      teamAsgnYn: result.team_asgn_yn,
      hndOvrYn: result.hnd_ovr_yn,
      usedYn: result.used_yn,
      ordItemId: result.ordItem_id,
      bttlOptId: result.bttl_opt_id,
      adncOptId: result.adnc_opt_id,

      bttlTeamNm: result.bttl_team_nm,

      optTit: result.adnc_opt_nm
        ? result.adnc_opt_nm
        : getBttlOptTit({
            bttlGnrCd: result.bttl_gnr_cd,
            bttlRule: result.bttl_rule,
            bttlMbrCnt: result.bttl_mbr_cnt,
          }),

      bttlrId: result.bttlr_id,
      bttlrNm: result.bttlr_nm,
      bttlrDncrNm: result.bttlr_dncr_nm,
      bttlrBirth: result.bttlr_birth,
      bttlrPhn: result.bttlr_phn,
      adncNm: result.adnc_nm,
      plnNm: result.pln_nm,
      plnRoadAddr: result.pln_road_addr,
      plnAddrDtl: result.pln_addr_dtl,
      plnDt: result.pln_dt,
      tcktThumb: result.tckt_thumb,
    }));

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
      "tckt.id",
      "tckt.teamAsgnYn AS team_asgn_yn",
      "tckt.hndOvrYn AS hnd_ovr_yn",
      "tckt.usedYn AS used_yn",
      "ordItem.id",
      "ordItem.bttlOptId AS bttl_opt_id",
      "ordItem.adncOptId AS adnc_opt_id",

      "bttlOpt.bttlGnrCd AS bttl_gnr_cd",
      "bttlOpt.bttlRule AS bttl_rule",
      "bttlOpt.bttlMbrCnt AS bttl_mbr_cnt",

      "bttlTeam.bttlTeamNm AS bttl_team_nm",

      "adncOpt.optNm AS adnc_opt_nm",

      "bttlr.id",
      "bttlr.bttlrNm AS bttlr_nm",
      "bttlr.bttlrDncrNm AS bttlr_dncr_nm",
      "bttlr.bttlrBirth AS bttlr_birth",
      "bttlr.bttlrPhn AS bttlr_phn",
      "adnc.adncNm AS adnc_nm",
      "pln.plnNm as pln_nm",
      "pln.plnRoadAddr as pln_road_addr",
      "pln.plnAddrDtl as pln_addr_dtl",
      "pln.plnDt as pln_dt",
      "file.fileNm as tckt_thumb",
    ]);

    queryBuilder.where("tckt.id = :tcktId", {
      tcktId: tcktId,
    });
    queryBuilder.andWhere("tckt.tcktStt = :tcktStt", { tcktStt: "PAID" });
    queryBuilder.andWhere("file.fileTypeCd = 'THMB_MN'");

    const result = await queryBuilder.getRawOne();

    if (result) {
      const tcktDtl = {
        tcktId: result.tckt_id,
        teamAsgnYn: result.team_asgn_yn,
        hndOvrYn: result.hnd_ovr_yn,
        usedYn: result.used_yn,
        ordItemId: result.ordItem_id,
        bttlOptId: result.bttl_opt_id,
        adncOptId: result.adnc_opt_id,

        bttlTeamNm: result.bttl_team_nm,

        optTit: result.adnc_opt_nm
          ? result.adnc_opt_nm
          : getBttlOptTit({
              bttlGnrCd: result.bttl_gnr_cd,
              bttlRule: result.bttl_rule,
              bttlMbrCnt: result.bttl_mbr_cnt,
            }),

        bttlrId: result.bttlr_id,
        bttlrNm: result.bttlr_nm,
        bttlrDncrNm: result.bttlr_dncr_nm,
        bttlrBirth: result.bttlr_birth,
        bttlrPhn: result.bttlr_phn,
        adncNm: result.adnc_nm,
        plnNm: result.pln_nm,
        plnRoadAddr: result.pln_road_addr,
        plnAddrDtl: result.pln_addr_dtl,
        plnDt: result.pln_dt,
        tcktThumb: result.tckt_thumb,
      };
      return tcktDtl;
    } else {
      throw new HttpException(
        "존재하지 않는 티켓입니다.",
        HttpStatus.NOT_FOUND
      );
    }
  }

  async useTcktById(tcktId: string) {
    this.tcktRepository.update({ id: tcktId }, { usedYn: "Y" });
  }
}
