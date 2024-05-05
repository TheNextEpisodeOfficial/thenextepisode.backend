import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";

import {
  EntityManager,
  InsertResult,
  LessThan,
  Like,
  MoreThan,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { SrchPlnDto, InsertPlanDto } from "./dtos/pln.dto";
import { Pagination, paginate } from "nestjs-typeorm-paginate";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { AdncOptEntity } from "../adncOpt/entities/adncOpt.entity";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";

@Injectable()
export class PlnService {
  constructor(
    @InjectRepository(PlnEntity)
    private readonly plnRepository: Repository<PlnEntity>,
    @InjectRepository(BttlOptEntity)
    private readonly bttlOptRepository: Repository<BttlOptEntity>,
    @InjectRepository(AdncOptEntity)
    private readonly adncOptRepository: Repository<AdncOptEntity>,
    private readonly entityManager: EntityManager
  ) {}

  getAllPln(): Promise<PlnEntity[]> {
    return this.plnRepository.find({
      where: {
        delYn: "N",
      },
    });
  }

  getPlnDtlById(plnId: string): Promise<PlnEntity> {
    return this.plnRepository.findOne({
      where: {
        id: plnId,
        delYn: "N",
      },
    });
  }

  getPlndPln(mbrId: string): Promise<PlnEntity[]> {
    return this.plnRepository.find({
      where: {
        // createMbrId: mbrId,
        delYn: "N",
      },
      order: { createStmp: "DESC" },
    });
  }

  async insertPln(pln: InsertPlanDto): Promise<InsertResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // const plnInsertResult = await this.plnRepository.upsert(pln, ["id"]);
        const plnInsertResult = await entityManager.insert(PlnEntity, pln);
        let insertedPln: ObjectLiteral = plnInsertResult.generatedMaps[0]; // 삽입된 pln의 객체를 가져온다

        // S : 배틀옵션 INSERT
        if (pln.bttlOpt.length && pln.plnTypeCd != "BTTL") {
          throw new HttpException(
            "플랜타입이 배틀인 경우에만 배틀옵션을 설정할 수 있습니다.",
            HttpStatus.BAD_REQUEST
          );
        } else {
          try {
            pln.bttlOpt.map(async (bttlOpt) => {
              // S : 배틀 옵션 INSERT
              let insertedBttlOpt = await entityManager.insert(BttlOptEntity, {
                ...bttlOpt,
                plnId: insertedPln.id,
              });
              // E : 배틀 옵션 INSERT

              console.log("bttlOpt:", bttlOpt);
              // S : 배틀 옵션 내의 역할 INSERT
              bttlOpt.bttlOptRole.map(async (role) => {
                await entityManager.insert(BttlOptRoleEntity, {
                  ...role,
                  bttlOptId: insertedBttlOpt.generatedMaps[0].id,
                });
              });
              // E : 배틀 옵션 내의 역할 INSERT
            });
          } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
        // E : 배틀옵션 INSERT

        // S : 입장옵션 INSERT
        if (pln.adncOpt.length) {
          try {
            await entityManager.insert(
              AdncOptEntity,
              pln.adncOpt.map((opt) => ({ ...opt, plnId: insertedPln.id }))
            );
          } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        } else {
          throw new HttpException(
            "입장옵션은 필수입니다. 한개 이상 생성해주세요.",
            HttpStatus.BAD_REQUEST
          );
        }
        // E : 입장옵션 INSERT

        // S : 플랜 이미지 정보 INSERT
        if (pln.plnImgs.length) {
          try {
            await entityManager.insert(
              FileEntity,
              pln.plnImgs.map((file) => ({
                ...file,
                fileGrpId: insertedPln.fileGrpId,
              }))
            );
          } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
        // E : 플랜 이미지 정보 INSERT

        await entityManager.query("COMMIT");
        return plnInsertResult;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  }

  async srchPln(srchPlnDto: SrchPlnDto): Promise<Pagination<PlnEntity>> {
    const queryBuilder = this.plnRepository.createQueryBuilder();
    const queryBuildOpts: Partial<SrchPlnDto> = {};

    if (srchPlnDto.plnNm) queryBuildOpts.plnNm = Like(`%${srchPlnDto.plnNm}%`);
    if (srchPlnDto.id) queryBuildOpts.id = srchPlnDto.id;
    if (srchPlnDto.plnTypeCd) queryBuildOpts.plnTypeCd = srchPlnDto.plnTypeCd;
    if (srchPlnDto.plnStTm) queryBuildOpts.plnStTm = srchPlnDto.plnStTm;
    if (srchPlnDto.plnEndTm) queryBuildOpts.plnEndTm = srchPlnDto.plnEndTm;
    if (srchPlnDto.rRatedYn) queryBuildOpts.rRatedYn = srchPlnDto.rRatedYn;
    if (srchPlnDto.delYn) queryBuildOpts.delYn = srchPlnDto.delYn;
    if (srchPlnDto.plnLctnNm)
      queryBuildOpts.plnLctnNm = Like(`%${srchPlnDto.plnLctnNm}%`);

    if (srchPlnDto.plnSrchStDt) {
      queryBuilder.andWhere({
        plnDt: MoreThan(srchPlnDto.plnSrchStDt),
      });
    }
    if (srchPlnDto.plnSrchEndDt) {
      queryBuilder.andWhere({
        plnDt: LessThan(srchPlnDto.plnSrchEndDt),
      });
    }

    queryBuilder.andWhere(queryBuildOpts); //where절 종료

    if (srchPlnDto.orderBy) {
      let order: [string, "DESC" | "ASC"] = srchPlnDto.orderBy.split(",");
      if (order.length < 2) {
        throw new HttpException(
          "orderBy의 파라미터는 <컬럼명,정렬방향>의 양식으로 입력해주세요",
          HttpStatus.BAD_REQUEST
        );
      }
      let orderColumn = order[0].trim();
      let orderValue = order[1].trim() as "DESC" | "ASC";
      if (!orderValue || (orderValue != "DESC" && orderValue != "ASC")) {
        throw new HttpException(
          "orderBy 두번째 파라미터는 DESC 혹은 ASC여야 합니다.",
          HttpStatus.BAD_REQUEST
        );
      }
      queryBuilder.orderBy(orderColumn, orderValue);
    } else {
      queryBuilder.orderBy("create_stmp", "DESC");
    }

    try {
      return paginate<PlnEntity>(queryBuilder, srchPlnDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: "플랜 검색중 오류가 발생했습니다.",
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        }
      );
    }
  }
}
