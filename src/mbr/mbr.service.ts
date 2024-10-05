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
import { JoinMbrDto, UpsertMbrAgreeDto, UpsertMbrDto } from "./dtos/mbr.dto";
import { SearchBttlOptRole } from "@src/bttlOptRole/dtos/bttlOptRole.dto";
import { MbrLogEntity } from "./entities/mbrLog.entity";

@Injectable()
export class MbrService {
  constructor(
    @InjectRepository(MbrEntity)
    private readonly mbrRepository: Repository<MbrEntity>,
    @InjectRepository(MbrLogEntity)
    private readonly mbrLogRepository: Repository<MbrLogEntity>,
    private readonly entityManager: EntityManager
  ) {}

  /**
   * email로 멤버 정보 조회
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
   * mbrId로 멤버 정보 조회
   * @param mbrId
   */
  findByMbrId(mbrId: string): Promise<MbrEntity> {
    return this.mbrRepository.findOne({
      where: {
        id: mbrId,
        delYn: "N",
      },
    });
  }

  /**
   * 멤버 생성
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
          logType: "C",
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
   * 회원가입
   * @returns
   * @param joinMbrDto
   */
  joinMbr(joinMbrDto: JoinMbrDto): Promise<UpdateResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // Mbr 수정
        const resultCreateMbr = await entityManager.update(
          MbrEntity,
          { id: joinMbrDto.mbr.id },
          { ...joinMbrDto.mbr, ...joinMbrDto.agree }
        );

        // MbrLog 삽입
        await entityManager.insert(MbrLogEntity, {
          mbrId: joinMbrDto.mbr.id,
          logType: "J",
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
   * 멤버 정보 업데이트
   * @returns
   * @param upsertMbrDto
   */
  updateMbr(upsertMbrDto: UpsertMbrDto): Promise<UpdateResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        const { id, ...updateData } = upsertMbrDto;

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
   * 키워드로 멤버의 id, mbrNm, nickNm을 조회
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

  /**
   * 회원 정지
   * @param mbrId
   */
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

  /**
   * 회원 탈퇴
   * @param mbrId
   */
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

  /**
   * 회원 복구
   * @param mbrId
   */
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

  /**
   * 회원 약관동의 수정
   * @param mbrId
   * @param upsertMbrAgreeDto
   */
  async updateMbrAgree(
    mbrId: string,
    upsertMbrAgreeDto: UpsertMbrAgreeDto
  ): Promise<UpdateResult> {
    return this.entityManager.transaction(async (entityManager) => {
      const { useTempToken, ...mbrAgreeDto } = upsertMbrAgreeDto;
      try {
        const resultCreateMbr = await entityManager.update(
          MbrEntity,
          { id: mbrId },
          mbrAgreeDto
        );

        // MbrLog 삽입
        await entityManager.insert(MbrLogEntity, {
          mbrId: mbrId,
          logType: "P",
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
   * 회원 약관동의 조회
   * @param mbrId
   */
  async getMbrAgree(mbrId: string): Promise<UpsertMbrAgreeDto> {
    return this.mbrRepository.findOne({
      select: [
        "termsAcceptYn",
        "privacyAcceptYn",
        "advertisementYn",
        "marketingYn",
        "smsYn",
        "emailYn",
        "kakaoYn",
      ],
      where: {
        id: mbrId,
      },
    });
  }
}
