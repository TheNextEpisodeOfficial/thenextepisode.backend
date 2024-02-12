import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";

import { Like, Repository } from "typeorm";
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

  upsrtPln(pln: UpsertPlanDto): void {
    this.plnRepository.upsert(pln, ["id"]);
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

    queryBuilder.where(queryBuildOpts).orderBy('createStmp', 'DESC');

    return paginate<PlnEntity>(queryBuilder, srchPlnDto);
  }
  
}
