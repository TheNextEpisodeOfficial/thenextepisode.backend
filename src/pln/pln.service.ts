import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, InsertResult, Like, Repository } from "typeorm";
import { Pagination, paginate } from "nestjs-typeorm-paginate";
import { randomUUID } from "crypto";

import { PlnEntity } from "@src/pln/entities/pln.entity";
import { SrchPlnDto } from "./dtos/pln.dto";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { AdncOptEntity } from "../adncOpt/entities/adncOpt.entity";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";
import { logger } from "@src/util/logger";

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
    private readonly entityManager: EntityManager
  ) {}

  /**
   *
   * @param pln
   */
  private async addPlnImgs(pln: PlnEntity): Promise<void> {
    const plnImgs = await this.s3FileRepository.find({
      where: { fileGrpId: pln.fileGrpId },
    });
    if (plnImgs) pln.plnImgs = plnImgs;
  }

  /**
   *
   * @param pln
   */
  private async addBttlOpt(pln: PlnEntity): Promise<void> {
    const bttlOpt = await this.bttlOptRepository.findBy({ plnId: pln.id });
    if (bttlOpt) {
      await Promise.all(
        bttlOpt.map(async (opt) => {
          const bttlOptRole = await this.bttlOptRoleRepository
            .createQueryBuilder("bor")
            .leftJoinAndSelect("bor.celeb", "c", "bor.role_celeb_id = c.id")
            .leftJoinAndSelect("bor.mbr", "m", "bor.role_mbr_id = m.id")
            .where("bor.bttlOptId = :bttlOptId", { bttlOptId: opt.id })
            .select([
              "bor.roleInPln",
              "c.id",
              "c.celebNm",
              "c.celebNckNm",
              "m.id",
              "m.mbrNm",
              "m.nickNm",
            ])
            .getMany();
          if (bttlOptRole) opt.bttlOptRole = bttlOptRole;
        })
      );
      pln.bttlOpt = bttlOpt;
    }
  }

  /**
   *
   * @param pln
   */
  private async addAdncOpt(pln: PlnEntity): Promise<void> {
    const adncOpt = await this.adncOptRepository.findBy({ plnId: pln.id });
    if (adncOpt) pln.adncOpt = adncOpt;
  }

  async getAllPln(): Promise<PlnEntity[]> {
    return this.plnRepository.find({ where: { delYn: "N" } });
  }

  /**
   *
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
   *
   * @param plnId
   * @returns
   */
  async getPlnDtlById(plnId: string): Promise<PlnEntity> {
    logger.log("start", "getPlnDtlById :: 플랜 상세 가져오기");
    const pln = await this.plnRepository.findOneBy({ id: plnId });
    if (!pln)
      throw new HttpException("플랜을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    await Promise.all([
      this.addPlnImgs(pln),
      this.addBttlOpt(pln),
      this.addAdncOpt(pln),
    ]).finally(() => logger.log("end", "getPlnDtlById :: 플랜 상세 가져오기"));
    return pln;
  }

  /**
   *
   * @param pln
   * @returns
   */
  async insertPln(pln: PlnEntity): Promise<InsertResult> {
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
        await Promise.all(
          pln.bttlOpt.map(async (bttlOpt) => {
            const insertedBttlOpt = await entityManager.insert(BttlOptEntity, {
              ...bttlOpt,
              plnId: insertedPln.id,
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
      }
    });
  }

  /**
   *
   * @param srchPlnDto
   * @returns
   */
  async srchPln(srchPlnDto: SrchPlnDto): Promise<Pagination<PlnEntity>> {
    const queryBuilder = this.plnRepository.createQueryBuilder("pln");
    const queryBuildOpts: Partial<SrchPlnDto> = {};

    if (srchPlnDto.plnNm) queryBuildOpts.plnNm = Like(`%${srchPlnDto.plnNm}%`);
    if (srchPlnDto.id) queryBuildOpts.id = srchPlnDto.id;
    if (srchPlnDto.plnTypeCd) queryBuildOpts.plnTypeCd = srchPlnDto.plnTypeCd;
    if (srchPlnDto.plnStTm) queryBuildOpts.plnStTm = srchPlnDto.plnStTm;
    if (srchPlnDto.plnEndTm) queryBuildOpts.plnEndTm = srchPlnDto.plnEndTm;
    if (srchPlnDto.rRatedYn) queryBuildOpts.rRatedYn = srchPlnDto.rRatedYn;
    if (srchPlnDto.delYn) queryBuildOpts.delYn = srchPlnDto.delYn || "N";
    if (srchPlnDto.plnLctnNm)
      queryBuildOpts.plnLctnNm = Like(`%${srchPlnDto.plnLctnNm}%`);

    if (srchPlnDto.plnSrchStDt)
      queryBuilder.andWhere("pln.plnDt > :plnSrchStDt", {
        plnSrchStDt: srchPlnDto.plnSrchStDt,
      });
    if (srchPlnDto.plnSrchEndDt)
      queryBuilder.andWhere("pln.plnDt < :plnSrchEndDt", {
        plnSrchEndDt: srchPlnDto.plnSrchEndDt,
      });

    queryBuilder.andWhere(queryBuildOpts);

    if (srchPlnDto.orderBy) {
      const [orderColumn, orderValue] = srchPlnDto.orderBy.split(",") as [
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

    try {
      const plnList = await paginate<PlnEntity>(queryBuilder, srchPlnDto);
      if (plnList.items.length) {
        await Promise.all(
          plnList.items.map(async (pln) => {
            const plnImgs = await this.s3FileRepository.find({
              where: {
                fileGrpId: pln.fileGrpId,
                fileTypeCd: "THMB_MN",
                delYn: "N",
              },
            });
            if (plnImgs) pln.plnImgs = plnImgs;
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
}
