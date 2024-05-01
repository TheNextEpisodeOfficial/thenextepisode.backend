import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { EntityManager, ILike, Repository } from "typeorm";
import { CelebEntity } from "./entities/celeb.entity";
import { SearchBttlOptRole } from "@src/bttlOptRole/dtos/bttlOptRole.dto";

@Injectable()
export class CelebService {
  constructor(
    @InjectRepository(CelebEntity)
    private readonly celebRepository: Repository<CelebEntity>
  ) {}

  async getCelebListByKeyword(keyword: string): Promise<SearchBttlOptRole[]> {
      let resultList = await this.celebRepository.find({
        select: ['id', 'celebNm', 'celebNckNm'],
        where: [
          { celebNm: ILike(`%${keyword}%`) },
          { celebNckNm: ILike(`%${keyword}%`) },
        ],
      });

      return resultList.map(celeb => {
        return {
            roleCelebId: celeb.id,
            celebNm: celeb.celebNm,
            celebNckNm: celeb.celebNckNm,
        };
      }); 
  }
}
