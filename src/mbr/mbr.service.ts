import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { ILike, InsertResult, IsNull, Repository, UpdateResult } from "typeorm";
import { MbrEntity } from "./entities/mbr.entity";
import { UpsertMbrDto } from "./dtos/mbr.dto";
import { SearchBttlOptRole } from "@src/bttlOptRole/dtos/bttlOptRole.dto";

@Injectable()
export class MbrService {
  constructor(
    @InjectRepository(MbrEntity)
    private readonly mbrRepository: Repository<MbrEntity>
  ) {}

  /**
   *
   * @param email
   * @returns
   */
  findByEmail(email: string): Promise<MbrEntity> {
    return this.mbrRepository.findOne({
      where: {
        email: email,
        delYn: "N",
      },
    });
  }

  /**
   *
   * @param upsertMbrDto
   * @returns
   */
  createMbr(upsertMbrDto: UpsertMbrDto): Promise<UpsertMbrDto & MbrEntity> {
    return this.mbrRepository.save(upsertMbrDto);
  }

  /**
   *
   * @param mbrId
   * @returns
   */
  getUserInfo(mbrId: string): Promise<MbrEntity> {
    return this.mbrRepository.findOne({
      where: {
        chnlMbrId: mbrId,
      },
    });
  }

  /**
   *
   * @param mbr
   * @returns
   */
  updateMbr(mbr: MbrEntity): Promise<UpdateResult> {
    return this.mbrRepository.update({ id: mbr.id }, { ...mbr });
  }

  /**
   *
   * @param keyword
   * @returns
   */
  async getMbrListByKeyword(keyword: string): Promise<SearchBttlOptRole[]> {
    let resultList = await this.mbrRepository.find({
      select: ["id", "mbrNm", "nickNm"],
      where: [
        { mbrNm: ILike(`%${keyword}%`), celebId: IsNull() },
        { nickNm: ILike(`%${keyword}%`), celebId: IsNull() },
      ],
    });

    return resultList.map((mbr) => {
      return {
        roleMbrId: mbr.id,
        mbrNm: mbr.mbrNm,
        nickNm: mbr.nickNm,
      };
    });
  }
}
