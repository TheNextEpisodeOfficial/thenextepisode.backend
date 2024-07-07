import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { OrdService } from "./ord.service";
import { OrdEntity } from "./entities/ord.entity";
import { ResponseDto } from "@src/types/response";
import { Pagination } from "nestjs-typeorm-paginate";
import { SrchOrdListDto } from "./dtos/ord.dto";
import { SessionData } from "express-session";
import { Request, Response } from "express";

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
  ): Promise<ResponseDto<{ ordId: string }>> {
    try {
      const ordInsertResult = await this.ordService.createOrd(ord);

      if (ordInsertResult) {
        let ordId = ordInsertResult.generatedMaps[0].id;
        let insertResult = new ResponseDto<{ ordId: string }>({
          status: 200,
          data: { ordId: ordId },
          message: "주문이 생성되었습니다.",
        });

        return insertResult;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : createOrd
   */

  /**
   * S : getOrdList
   */
  @Get("/getOrdList")
  @ApiOperation({
    summary: "주문 결제 리스트 조회",
    description: "주문 결제 리스트를 조회한다.",
  })
  @ApiCreatedResponse({
    description: "주문 결제 리스트를 조회한다.",
    type: OrdEntity,
  })
  async getOrdList(
    srchOrdListDto: SrchOrdListDto,
    @Req() req: Request
  ): Promise<Pagination<OrdEntity>> {
    // let session: SessionData = req.session;
    // if (!session.loginUser) {
    //   throw new HttpException(
    //     "토큰이 유효하지 않습니다.",
    //     HttpStatus.INTERNAL_SERVER_ERROR
    //   );
    // }
    // srchOrdListDto.mbrId = session.loginUser.id;

    try {
      const ordList = await this.ordService.getOrdList({
        ...srchOrdListDto,
        mbrId: "15a6e7db-a719-47e3-9ee1-f881b24f02f7",
      });
      return ordList;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : getOrdList
   */

  /**
   * S : getOrdDtlById
   */
  @Get("/getOrdDtlById")
  @ApiOperation({
    summary: "주문 결제 리스트 조회",
    description: "주문 결제 리스트를 조회한다.",
  })
  @ApiCreatedResponse({
    description: "주문 결제 리스트를 조회한다.",
    type: OrdEntity,
  })
  @ApiQuery({
    name: "ordId",
    required: true,
    description: "주문 아이디",
    type: String,
  })
  async getOrdDtlById(ordId: string, @Req() req: Request): Promise<OrdEntity> {
    try {
      const ordList = await this.ordService.getOrdDtlById(ordId);
      return ordList;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : getOrdList
   */
}
