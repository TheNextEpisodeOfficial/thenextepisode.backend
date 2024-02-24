import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";

import { InsertResult, LessThan, Like, MoreThan, Repository } from "typeorm";
import { SrchPlnDto, UpsertPlanDto } from "./dtos/pln.dto";
import { IPaginationOptions, Pagination, paginate } from "nestjs-typeorm-paginate";

@Injectable()
export class PlnService {
  constructor(
    @InjectRepository(PlnEntity)
    private readonly plnRepository: Repository<PlnEntity>
  ) {}

  getAllPln(): Promise<PlnEntity[]> {
    return this.plnRepository.find({
      where: {
        delYn: "N",
      },
    });
  }

  getPlnById(plnId: string): Promise<PlnEntity> {
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

  upsrtPln(pln: UpsertPlanDto): Promise<InsertResult> {
    return this.plnRepository.upsert(pln, ["id"]);
  }

  async srchPln(srchPlnDto: SrchPlnDto): Promise<Pagination<PlnEntity>> {
    const queryBuilder = this.plnRepository.createQueryBuilder();
    const queryBuildOpts: Partial<SrchPlnDto> = {};
    
    if (srchPlnDto.id) queryBuildOpts.id = srchPlnDto.id;
    if (srchPlnDto.plnTypeCd) queryBuildOpts.plnTypeCd = srchPlnDto.plnTypeCd;
    if (srchPlnDto.plnStTm) queryBuildOpts.plnStTm = srchPlnDto.plnStTm;
    if (srchPlnDto.plnEndTm) queryBuildOpts.plnEndTm = srchPlnDto.plnEndTm;
    if (srchPlnDto.rRatedYn) queryBuildOpts.rRatedYn = srchPlnDto.rRatedYn;
    if (srchPlnDto.delYn) queryBuildOpts.delYn = srchPlnDto.delYn;
    if (srchPlnDto.plnNm) queryBuildOpts.plnNm = Like(`%${srchPlnDto.plnNm}%`);
    if (srchPlnDto.plnLctnNm) queryBuildOpts.plnLctnNm = Like(`%${srchPlnDto.plnLctnNm}%`);

    if (srchPlnDto.plnSrchStDt) {
      queryBuilder.andWhere({
        plnDt: MoreThan(srchPlnDto.plnSrchStDt)
      })
    };
    if (srchPlnDto.plnSrchEndDt) {
      queryBuilder.andWhere({
        plnDt: LessThan(srchPlnDto.plnSrchEndDt)
      })
    };

    queryBuilder.andWhere(queryBuildOpts); //where절 종료

    if(srchPlnDto.orderBy) {
      let order: [string, 'DESC' | 'ASC'] = srchPlnDto.orderBy.split(',')
      queryBuilder.orderBy(order[0], order[1]);
    } else {
      queryBuilder.orderBy('createStmp', 'DESC');
    }

    return paginate<PlnEntity>(queryBuilder, srchPlnDto);
  }
  
}
