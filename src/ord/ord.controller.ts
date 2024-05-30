import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InsertResult } from "typeorm";
import { OrdService } from "./ord.service";
import { OrdEntity } from "./entities/ord.entity";

/**
 * OrdController : 주문 API를 관리한다
 */
@Controller("/ord")
@ApiTags("Ord")
export class OrdController {
  constructor(private readonly ordService: OrdService) {}

  /**
   * S : createOrd
   */
  @Get("/createOrd")
  @ApiOperation({
    summary:
      "주문을 생성한다. <주문, 주문상품, 배틀러|관람객> 테이블을 생성한다.",
    description: "플랜 ID로 플랜 상세를 가져온다.",
  })
  @ApiCreatedResponse({
    description:
      "주문을 생성한다. <주문, 주문상품, 배틀러|관람객> 테이블을 생성한다.",
    type: OrdEntity,
  })
  async createOrd(ord: OrdEntity): Promise<InsertResult> {
    try {
      const ordInsertResult = await this.ordService.createOrd(ord);
      return ordInsertResult;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : createOrd
   */
}