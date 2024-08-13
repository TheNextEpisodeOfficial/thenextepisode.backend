import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  EntityManager,
  ILike,
  InsertResult,
  IsNull,
  Repository,
  UpdateResult,
} from "typeorm";
import { MbrEntity } from "./entities/mbr.entity";
import { UpsertMbrDto } from "./dtos/mbr.dto";
import { SearchBttlOptRole } from "@src/bttlOptRole/dtos/bttlOptRole.dto";
import { MbrLogEntity } from "./entities/mbrLog.entity";
import { MbrAgreeEntity } from "./entities/mbrAgree.entity";

@Injectable()
export class MbrService {
  constructor(
    @InjectRepository(MbrEntity)
    private readonly mbrRepository: Repository<MbrEntity>,
    @InjectRepository(MbrLogEntity)
    private readonly mbrLogRepository: Repository<MbrLogEntity>,
    @InjectRepository(MbrAgreeEntity)
    private readonly mbrAgreeRepository: Repository<MbrAgreeEntity>,
    private readonly entityManager: EntityManager
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
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // Mbr 생성
        const resultCreateMbr = await entityManager.save(
          MbrEntity,
          upsertMbrDto
        );

        // MbrLog 삽입
        await entityManager.insert(MbrLogEntity, {
          mbrId: resultCreateMbr.id,
          logType: "J",
        });

        // MbrAgree 삽입
        await entityManager.insert(MbrAgreeEntity, {
          mbrId: resultCreateMbr.id,
        });

        return resultCreateMbr;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
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
    return this.entityManager.transaction(async (entityManager) => {
      try {
        const { id, ...updateData } = mbr;

        // Mbr 수정
        const resultCreateMbr = await entityManager.update(
          MbrEntity,
          { id: id },
          updateData
        );

        // MbrLog 삽입
        await entityManager.insert(MbrLogEntity, {
          mbrId: id,
          logType: "U",
        });

        return resultCreateMbr;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
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

  // 회원 정지
  async blockMbr(mbrId: string): Promise<UpdateResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // Mbr 수정
        const resultCreateMbr = await entityManager.update(
          MbrEntity,
          { id: mbrId },
          { mbrSttCd: 2, delYn: "Y" }
        );

        // MbrLog 삽입
        await entityManager.insert(MbrLogEntity, {
          mbrId: mbrId,
          logType: "B",
        });

        return resultCreateMbr;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  }

  // 회원 탈퇴
  async withdrawMbr(mbrId: string): Promise<UpdateResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // Mbr 수정
        const resultCreateMbr = await entityManager.update(
          MbrEntity,
          { id: mbrId },
          { mbrSttCd: 3, delYn: "Y" }
        );

        // MbrLog 삽입
        await entityManager.insert(MbrLogEntity, {
          mbrId: mbrId,
          logType: "Q",
        });

        return resultCreateMbr;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  }

  //회원 복구
  async recoverMbr(mbrId: string): Promise<UpdateResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // Mbr 수정
        const resultCreateMbr = await entityManager.update(
          MbrEntity,
          { id: mbrId },
          { mbrSttCd: 1, delYn: "N" }
        );

        // MbrLog 삽입
        await entityManager.insert(MbrLogEntity, {
          mbrId: mbrId,
          logType: "R",
        });

        return resultCreateMbr;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  }

  // 회원 약관동의 수정
  async updateMbrAgree(mbrAgree: MbrAgreeEntity): Promise<UpdateResult> {
    const { mbrId, ...updateData } = mbrAgree;
    return this.mbrAgreeRepository.update({ mbrId: mbrId }, updateData);
  }
}
