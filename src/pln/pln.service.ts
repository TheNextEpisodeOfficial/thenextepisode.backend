import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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
    
    if (srchPlnDto.plnNm) queryBuildOpts.plnNm = Like(`%${srchPlnDto.plnNm}%`);
    if (srchPlnDto.id) queryBuildOpts.id = srchPlnDto.id;
    if (srchPlnDto.plnTypeCd) queryBuildOpts.plnTypeCd = srchPlnDto.plnTypeCd;
    if (srchPlnDto.plnStTm) queryBuildOpts.plnStTm = srchPlnDto.plnStTm;
    if (srchPlnDto.plnEndTm) queryBuildOpts.plnEndTm = srchPlnDto.plnEndTm;
    if (srchPlnDto.rRatedYn) queryBuildOpts.rRatedYn = srchPlnDto.rRatedYn;
    if (srchPlnDto.delYn) queryBuildOpts.delYn = srchPlnDto.delYn;
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
      let order: [string, 'DESC' | 'ASC'] = srchPlnDto.orderBy.split(',');
      if(order.length < 2) {
        throw new HttpException('orderBy의 파라미터는 <컬럼명,정렬방향>의 양식으로 입력해주세요', HttpStatus.BAD_REQUEST)
      }
      let orderColumn = order[0].trim();
      let orderValue = order[1].trim() as 'DESC' | 'ASC';
      if(!orderValue || (orderValue != 'DESC' && orderValue != 'ASC')) {
        throw new HttpException('orderBy 두번째 파라미터는 DESC 혹은 ASC여야 합니다.', HttpStatus.BAD_REQUEST)
      }
      queryBuilder.orderBy(orderColumn, orderValue);
    } else {
      queryBuilder.orderBy('createStmp', 'DESC');
    }

    try {
      return paginate<PlnEntity>(queryBuilder, srchPlnDto);
    } catch(error) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: '플랜 검색중 오류가 발생했습니다.',
      }, HttpStatus.FORBIDDEN, {
        cause: error
      });
    }
  }
  
}
