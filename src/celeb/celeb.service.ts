import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { EntityManager, Repository } from "typeorm";
import { CelebEntity } from "./entities/celeb.entity";

@Injectable()
export class CelebService {
  constructor(
    @InjectRepository(CelebEntity)
    private readonly celebRepository: Repository<CelebEntity>,
    private readonly entityManager: EntityManager
  ) {}

  async getCelebListByKeyword(keyword: string) {
    return this.celebRepository
      .createQueryBuilder()
      .where(
        "celeb_nm LIKE :keyword OR celeb_nck_nm LIKE :keyword AND CelebEntity.delYn = 'N'",
        {
          keyword: `%${keyword}%`,
        }
      )
      .getMany();
  }
}
