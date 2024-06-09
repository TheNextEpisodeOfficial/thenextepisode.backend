import { Injectable } from "@nestjs/common";
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
  async getMyTckts(mbrId: string): Promise<TicketListDto[]> {
    const queryBuilder = this.tcktRepository
      .createQueryBuilder("tckt")
      .leftJoinAndSelect("tckt.ordItem", "ordItem")
      .leftJoinAndSelect("tckt.bttlr", "bttlr")
      .leftJoinAndSelect("tckt.adnc", "adnc")
      .leftJoinAndSelect("ordItem.bttlOpt", "bttlOpt")
      .leftJoinAndSelect("ordItem.adncOpt", "adncOpt")
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
      "tckt.teamAsgnYn",
      "tckt.hndOvrYn",
      "tckt.usedYn",
      "ordItem.id",
      "ordItem.bttlOptId",
      "ordItem.adncOptId",
      "CONCAT(bttlOpt.bttlRule, bttlOpt.bttlMbrCnt, 'ON', bttlOpt.bttlMbrCnt) AS bttl_opt_tit",
      "bttlr.id",
      "bttlr.bttlrNm",
      "bttlr.bttlrDncrNm",
      "bttlr.bttlrBirth",
      "bttlr.bttlrPhn",
      "adnc.adncNm",
      "pln.plnNm as pln_nm",
      "pln.plnRoadAddr as pln_road_addr",
      "pln.plnAddrDtl as pln_addr_dtl",
      "pln.plnDt as pln_dt",
      "file.fileNm as tckt_thumb",
    ]);

    queryBuilder.where("tckt.tcktHldMbrId = :mbrId", { mbrId });
    // queryBuilder.where("tckt.tcktHldMbrId = :mbrId", {
    //   mbrId: "15a6e7db-a719-47e3-9ee1-f881b24f02f7",
    // });
    queryBuilder.andWhere("tckt.tcktStt = :tcktStt", { tcktStt: "PAID" });
    queryBuilder.andWhere("file.fileTypeCd = 'THMB_MN'");

    const rawResults = await queryBuilder.getRawMany();

    const ticketList: TicketListDto[] = rawResults.map((result) => ({
      tcktId: result.tckt_id,
      teamAsgnYn: result.tckt_team_asgn_yn,
      hndOvrYn: result.tckt_hnd_ovr_yn,
      usedYn: result.tckt_used_yn,
      ordItemId: result.ordItem_id,
      bttlOptId: result.ordItem_bttl_opt_id,
      adncOptId: result.ordItem_adnc_opt_id,
      bttlOptTit: result.bttl_opt_tit,
      bttlrId: result.bttlr_id,
      bttlrNm: result.bttlr_bttlr_nm,
      bttlrDncrNm: result.bttlr_bttlr_dncr_nm,
      bttlrBirth: result.bttlr_bttlr_birth,
      bttlrPhn: result.bttlr_bttlr_phn,
      adncNm: result.adnc_adnc_nm,
      plnNm: result.pln_nm,
      plnRoadAddr: result.pln_road_addr,
      plnAddrDtl: result.pln_addr_dtl,
      plnDt: result.pln_dt,
      tcktThumb: result.tckt_thumb,
    }));

    console.log(ticketList);

    return ticketList;
  }
}
