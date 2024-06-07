import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InsertResult } from "typeorm";
import { OrdService } from "./ord.service";
import { OrdEntity } from "./entities/ord.entity";
import { Response } from "@src/types/response";

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
  @Post("/createOrd")
  @ApiOperation({
    summary:
      "주문을 생성한다. <주문, 주문상품, 배틀러|관람객> 데이터를 생성한다.",
    description: "플랜 ID로 플랜 상세를 가져온다.",
  })
  @ApiCreatedResponse({
    description:
      "주문을 생성한다. <주문, 주문상품, 배틀러|관람객> 데이터를 생성한다.",
    type: OrdEntity,
  })
  async createOrd(
    @Body() ord: OrdEntity
  ): Promise<Response<{ ordId: string }>> {
    try {
      const ordInsertResult = await this.ordService.createOrd(ord);

      if (ordInsertResult) {
        let ordId = ordInsertResult.generatedMaps[0].id;
        let insertResult = new Response<{ ordId: string }>();
        insertResult.data = { ordId: ordId };

        return insertResult;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : createOrd
   */
}
