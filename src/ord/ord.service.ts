import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdncEntity } from "@src/adnc/entities/adnc.entity";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";

import {
  EntityManager,
  InsertResult,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { OrdEntity } from "./entities/ord.entity";

@Injectable()
export class OrdService {
  constructor(
    @InjectRepository(OrdEntity)
    private readonly entityManager: EntityManager
  ) {}

  /**
   *
   * @returns Promise<InsertResult>
   */
  createOrd(ord: OrdEntity): Promise<InsertResult> {
    return this.entityManager.transaction(async (entityManager) => {
      try {
        // S : 주문 INSERT
        const ordInsertResult = await entityManager.insert(OrdEntity, ord);

        let insertedOrd: ObjectLiteral = ordInsertResult.generatedMaps[0]; // 삽입된 ord의 객체를 가져온다
        // E : 주문 INSERT

        // S : 주문 상품 및 관람객, 참가자 INSERT && 티켓 생성
        ord.ordItem.map(async (item) => {
          // S : 주문 상품 INSERT
          let insertedOrdItem = await entityManager.insert(OrdItemEntity, {
            ...item,
            ordId: insertedOrd.id,
          });
          // S : 주문 상품 INSERT

          if (!item.adncOptId && !item.bttlOptId) {
            throw new HttpException(
              "주문상품의 옵션 id는 필수입니다.",
              HttpStatus.BAD_REQUEST
            );
          } else if (item.adncOptId && item.bttlOptId) {
            throw new HttpException(
              "주문상품의 옵션 id는 한가지 타입만 존재할 수 있습니다.",
              HttpStatus.BAD_REQUEST
            );
          } else if (item.adncOptId) {
            // S : 관람객 INSERT
            await entityManager.insert(AdncEntity, item.adnc);
            // E : 관람객 INSERT
          } else if (item.bttlOptId) {
            // S : 배틀 팀 및 배틀러 INSERT
            await entityManager.save(
              BttlTeamEntity
              // ,item.adnc.map((adnc) => ({ ...adnc, adncOptId: item.adncOptId }))
            );
            // E : 배틀 팀 및 배틀러 INSERT
          } else {
            throw new HttpException(
              "주문상품의 정보가 올바르지 않습니다.",
              HttpStatus.BAD_REQUEST
            );
          }
        });
        // E : 주문 상품 및 관람객, 참가자 INSERT && 티켓 생성

        await entityManager.query("COMMIT");
        return ordInsertResult;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  }
}
