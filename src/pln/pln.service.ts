import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  EntityManager,
  InsertResult,
  Like,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { Pagination, paginate } from "nestjs-typeorm-paginate";
import { randomUUID } from "crypto";

import { PlnEntity } from "@src/pln/entities/pln.entity";
import { SrchPlnDto } from "./dtos/pln.dto";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { AdncOptEntity } from "../adncOpt/entities/adncOpt.entity";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";
import { logger } from "@src/util/logger";
import { getBttlOptTit } from "@src/util/system";
import dayjs from "dayjs";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";

@Injectable()
export class PlnService {
  constructor(
    @InjectRepository(PlnEntity)
    private readonly plnRepository: Repository<PlnEntity>,
    @InjectRepository(BttlOptEntity)
    private readonly bttlOptRepository: Repository<BttlOptEntity>,
    @InjectRepository(BttlOptRoleEntity)
    private readonly bttlOptRoleRepository: Repository<BttlOptRoleEntity>,
    @InjectRepository(AdncOptEntity)
    private readonly adncOptRepository: Repository<AdncOptEntity>,
    @InjectRepository(FileEntity)
    private readonly s3FileRepository: Repository<FileEntity>,
    @InjectRepository(OrdItemEntity)
    private readonly ordItemRepository: Repository<OrdItemEntity>,
    private readonly entityManager: EntityManager
  ) {}

  // 배틀, 입장 신청 가능 디폴트 매수
  private readonly bttlRsvAbleCnt = 1;
  private readonly adncRsvAbleCnt = 2;

  /**
   * 플랜의 fileGrpId로 이미지 리스트를 조회한다.
   * @param pln
   */
  private async addPlnImgs(pln: PlnEntity): Promise<void> {
    const plnImgs = await this.s3FileRepository.find({
      where: { fileGrpId: pln.fileGrpId },
    });
    if (plnImgs) pln.plnImgs = plnImgs;
  }

  private async validReserveStt(
    opt: BttlOptEntity | AdncOptEntity,
    type: "adnc" | "bttl",
    mbrId: string
  ): Promise<void> {
    const maxRsvCnt: number = opt.maxRsvCnt;
    const crntRsvCnt: number = opt.crntRsvCnt;

    // 예약 시작일시와 종료일시를 비교하여 현재 시간이 예약 가능한지 확인
    const now = dayjs();

    // 로그인 되지 않은 상태일 때 기본 예매 가능 매수 보여주기
    opt.rsvAbleCnt =
      type === "bttl" ? this.bttlRsvAbleCnt : this.adncRsvAbleCnt;

    // 로그인 된 상태일 때 ordItemEntity에서 해당 opt.id로 예매한 내역이 있는지 확인
    if (mbrId) {
      const queryBuilder = this.ordItemRepository
        .createQueryBuilder("ordItem")
        .leftJoinAndSelect("ordItem.ord", "ord")
        .where(
          "ordItem." +
            (type === "bttl" ? "bttlOptId" : "adncOptId") +
            " = :optId",
          {
            optId: opt.id,
          }
        )
        .andWhere("ord.ordMbrId = :ordMbrId", {
          ordMbrId: mbrId,
        })
        .andWhere("ord.ordStt = 'PAID'");

      const ordItemHistory = await queryBuilder.getOne();

      // 예약 가능 매수를 계산
      if (ordItemHistory) {
        opt.rsvAbleCnt -= ordItemHistory.qty;
      }
    }

    if (maxRsvCnt - crntRsvCnt === 0) {
      // 최대 신청 팀수와 현재 신청 팀수가 같을 경우 매진
      opt.optSttCd = "SOLDOUT";
    } else if (now.isAfter(opt.rsvEndDt)) {
      opt.optSttCd = "CLOSED";
    } else if (now.isBefore(opt.rsvStDt)) {
      opt.optSttCd = "YET";
    } else if (opt.rsvAbleCnt <= 0) {
      opt.optSttCd = "ALREADY";
    } else {
      opt.optSttCd = "OPEN";
    }

    // 예약 불가인 상태일 때 예약 가능 매수를 0으로 설정
    switch (opt.optSttCd) {
      case "SOLDOUT":
      case "CLOSED":
      case "YET":
      case "ALREADY":
        opt.rsvAbleCnt = 0;
        break;
      default:
        break;
    }
  }

  /**
   * 플랜 id를 기준으로 배틀옵션을 조회 후, 각 옵션별 역할(JUDGE, MC, DJ)을 조회한다.
   * @param pln
   */
  private async addBttlOpt(pln: PlnEntity): Promise<void> {
    const bttlOpt = await this.bttlOptRepository.findBy({ plnId: pln.id });
    if (bttlOpt && bttlOpt.length > 0) {
      const bttlOptIds = bttlOpt.map((opt) => {
        this.validReserveStt(opt, "bttl", pln.mbrId);
        return opt.id;
      });

      const bttlOptRoles = await this.bttlOptRoleRepository
        .createQueryBuilder("bor")
        .leftJoinAndSelect("bor.celeb", "c", "bor.role_celeb_id = c.id")
        .leftJoinAndSelect("bor.mbr", "m", "bor.role_mbr_id = m.id")
        .where("bor.bttlOptId IN (:...bttlOptIds)", { bttlOptIds })
        .select([
          "bor.bttlOptId",
          "bor.roleInPln",
          "c.id",
          "c.celebNm",
          "c.celebNckNm",
          "m.id",
          "m.mbrNm",
          "m.nickNm",
        ])
        .getMany();

      const rolesGroupedByBttlOptId = bttlOptRoles.reduce((acc, role) => {
        if (!acc[role.bttlOptId]) {
          acc[role.bttlOptId] = [];
        }
        acc[role.bttlOptId].push(role);
        return acc;
      }, {});

      await Promise.all(
        bttlOpt.map(async (opt) => {
          opt.optTit = getBttlOptTit(opt);
          opt.bttlOptRole = rolesGroupedByBttlOptId[opt.id] || [];
        })
      );
      pln.bttlOpt = bttlOpt;
    }
  }

  /**
   * 플랜 id로 입장 옵션을 조회한다.
   * @param pln
   */
  private async addAdncOpt(pln: PlnEntity): Promise<void> {
    const adncOpt = await this.adncOptRepository.findBy({ plnId: pln.id });
    adncOpt.map((opt) => {
      this.validReserveStt(opt, "adnc", pln.mbrId);
    });
    if (adncOpt) pln.adncOpt = adncOpt;
  }

  async getAllPln(): Promise<PlnEntity[]> {
    return this.plnRepository.find({ where: { delYn: "N" } });
  }

  /**
   * 멤버 아이디로 기획한 플랜 리스트를 조회한다.
   * @param mbrId
   * @returns
   */
  async getPlndPln(mbrId: string): Promise<PlnEntity[]> {
    return this.plnRepository.find({
      where: { createdBy: mbrId, delYn: "N" },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * 플랜 ID로 플랜의 상세정보를 조회한다.
   * @param plnId
   * @param mbrId
   * @returns
   */
  async getPlnDtlById(plnId: string, mbrId: string): Promise<PlnEntity> {
    logger.log("start", "getPlnDtlById :: 플랜 상세 가져오기");
    const pln = await this.plnRepository.findOneBy({ id: plnId });
    pln.mbrId = mbrId;

    if (!pln) {
      throw new HttpException("플랜을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
    await Promise.all([
      this.addPlnImgs(pln),
      this.addBttlOpt(pln),
      this.addAdncOpt(pln),
    ]).finally(() => logger.log("end", "getPlnDtlById :: 플랜 상세 가져오기"));
    return pln;
  }

  /**
   * 플랜 INSERT SERVICE
   * @param pln
   * @returns
   */
  async insertPln(pln: PlnEntity): Promise<InsertResult> {
    logger.log("start", "insertPln :: 플랜 등록");
    return this.entityManager.transaction(async (entityManager) => {
      try {
        const fileGrpId = randomUUID();
        const plnInsertResult = await entityManager.insert(PlnEntity, {
          ...pln,
          fileGrpId,
        });
        const insertedPln = plnInsertResult.generatedMaps[0];

        if (pln.plnTypeCd === "BTTL" && !pln.bttlOpt.length) {
          throw new HttpException(
            "플랜타입이 배틀인 경우에만 배틀옵션을 설정할 수 있습니다.",
            HttpStatus.BAD_REQUEST
          );
        }
        await this.insertBttlOpts(pln.bttlOpt, insertedPln.id, entityManager);

        if (!pln.adncOpt.length) {
          throw new HttpException(
            "입장옵션은 필수입니다. 한개 이상 생성해주세요.",
            HttpStatus.BAD_REQUEST
          );
        }
        await entityManager.insert(
          AdncOptEntity,
          pln.adncOpt.map((opt) => ({ ...opt, plnId: insertedPln.id }))
        );

        if (pln.plnImgs.length) {
          await entityManager.insert(
            FileEntity,
            pln.plnImgs.map((img) => ({ ...img, fileGrpId }))
          );
        }

        return plnInsertResult;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { cause: error }
        );
      } finally {
        logger.log("end", "insertPln :: 플랜 등록");
      }
    });
  }

  /**
   * 배틀옵션 데이터를 INSERT 한다.
   * @param bttlOpts
   * @param plnId
   * @param entityManager
   */
  private async insertBttlOpts(
    bttlOpts: BttlOptEntity[],
    plnId: string,
    entityManager: EntityManager
  ): Promise<void> {
    await Promise.all(
      bttlOpts.map(async (bttlOpt) => {
        const insertedBttlOpt = await entityManager.insert(BttlOptEntity, {
          ...bttlOpt,
          plnId,
        });
        await Promise.all(
          bttlOpt.bttlOptRole.map(async (role) => {
            await entityManager.insert(BttlOptRoleEntity, {
              ...role,
              bttlOptId: insertedBttlOpt.generatedMaps[0].id,
            });
          })
        );
      })
    );
  }

  /**
   * 플랜 검색 SERVICE
   * @param srchPlnDto
   * @returns
   */
  async srchPln(srchPlnDto: SrchPlnDto): Promise<Pagination<PlnEntity>> {
    const queryBuilder = this.plnRepository.createQueryBuilder("pln");
    queryBuilder
      .leftJoinAndSelect("pln.file", "file")
      .where("pln.fileGrpId = file.fileGrpId")
      .andWhere("file.fileTypeCd = 'THMB_MN'")
      .andWhere("file.delYn = 'N'");

    const searchConditions = this.buildSearchConditions(srchPlnDto);
    queryBuilder.andWhere(searchConditions);

    if (srchPlnDto.plnSrchStDt)
      queryBuilder.andWhere("pln.plnDt > :plnSrchStDt", {
        plnSrchStDt: srchPlnDto.plnSrchStDt,
      });
    if (srchPlnDto.plnSrchEndDt)
      queryBuilder.andWhere("pln.plnDt < :plnSrchEndDt", {
        plnSrchEndDt: srchPlnDto.plnSrchEndDt,
      });

    this.addOrderBy(queryBuilder, srchPlnDto.orderBy);

    try {
      const plnList = await paginate<PlnEntity>(queryBuilder, srchPlnDto);
      if (plnList.items.length) {
        await Promise.all(
          plnList.items.map(async (pln) => {
            if (pln.file.length && pln.file[0].fileTypeCd == "THMB_MN") {
              pln.thumb = pln.file[0].fileNm;
            }
          })
        );
      }
      return plnList;
    } catch (error) {
      throw new HttpException(
        "플랜 검색 중 오류가 발생했습니다.",
        HttpStatus.FORBIDDEN,
        { cause: error }
      );
    }
  }

  /**
   * 플랜 검색 쿼리 조건 필터링
   * @param srchPlnDto
   * @returns
   */
  private buildSearchConditions(srchPlnDto: SrchPlnDto): Partial<SrchPlnDto> {
    const searchConditions: Partial<SrchPlnDto> = {};
    if (srchPlnDto.plnNm)
      searchConditions.plnNm = Like(`%${srchPlnDto.plnNm}%`);
    if (srchPlnDto.id) searchConditions.id = srchPlnDto.id;
    if (srchPlnDto.plnTypeCd) searchConditions.plnTypeCd = srchPlnDto.plnTypeCd;
    if (srchPlnDto.plnStTm) searchConditions.plnStTm = srchPlnDto.plnStTm;
    if (srchPlnDto.plnEndTm) searchConditions.plnEndTm = srchPlnDto.plnEndTm;
    if (srchPlnDto.rRatedYn) searchConditions.rRatedYn = srchPlnDto.rRatedYn;
    if (srchPlnDto.delYn) searchConditions.delYn = srchPlnDto.delYn || "N";
    if (srchPlnDto.plnLctnNm)
      searchConditions.plnLctnNm = Like(`%${srchPlnDto.plnLctnNm}%`);
    if (srchPlnDto.createdBy) searchConditions.createdBy = srchPlnDto.createdBy;
    return searchConditions;
  }

  /**
   * 플랜 검색 정렬 조건 세팅
   * @param queryBuilder
   * @param orderBy
   */
  private addOrderBy(
    queryBuilder: SelectQueryBuilder<PlnEntity>,
    orderBy?: string
  ): void {
    if (orderBy) {
      const [orderColumn, orderValue] = orderBy.split(",") as [
        string,
        "DESC" | "ASC"
      ];
      if (!orderColumn || (orderValue !== "DESC" && orderValue !== "ASC")) {
        throw new HttpException(
          "orderBy의 파라미터는 <컬럼명,정렬방향>의 양식으로 입력해주세요",
          HttpStatus.BAD_REQUEST
        );
      }
      queryBuilder.orderBy(orderColumn, orderValue);
    } else {
      queryBuilder.orderBy("pln.createdAt", "DESC");
    }
  }
}
