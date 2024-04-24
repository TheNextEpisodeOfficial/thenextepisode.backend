import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { EntityManager, Repository } from "typeorm";
import { CelebEntity } from "./entities/celeb.entity";

@Injectable()
export class CelebService {
  constructor(
    @InjectRepository(CelebEntity)
    private readonly celebRepository: Repository<CelebEntity>
  ) {}

  async getCelebListByKeyword(keyword: string) {
    return this.celebRepository.query(`
        select
          c.id as "celebId",
          c.celeb_nm as "celebNm",
          c.celeb_nck_nm as "celebNckNm",
          c.celeb_type_cd as "celebTypeCd",
          m.id as "roleMbrId",
          m.mbr_nm as "mbrNm",
          m.nick_nm as "nickNm"
        FROM celeb c
        FULL OUTER JOIN mbr m ON c.celeb_mbr_id = m.id::text
        WHERE
          (c.celeb_nm LIKE '%${keyword}%' OR c.celeb_nck_nm LIKE '%${keyword}%'
          OR m.mbr_nm LIKE '%${keyword}%' OR m.nick_nm LIKE '%${keyword}%')
          AND (COALESCE(c.del_yn, 'N') = 'N' AND COALESCE(m.del_yn, 'N') = 'N');      
        `);
  }
}
