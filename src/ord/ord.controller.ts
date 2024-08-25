import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
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
@ApiTags("Order")
export class OrdController {
  constructor(private readonly ordService: OrdService) {}

  /**
   * S : createOrdTimer
   */
  @Post("/createOrdTimer")
  @ApiOperation({
    summary: "주문 타이머 생성",
    description: "주문 타이머를 생성한다.",
  })
  @ApiCreatedResponse({
    description: "주문 타이머를 생성한다.",
  })
  async createOrdTimer(): Promise<ResponseDto<{ timerId: string }>> {
    try {
      const createTimerResult = await this.ordService.createOrdTimer();

      if (createTimerResult) {
        let ordId = createTimerResult.generatedMaps[0].id;
        let returnValue = new ResponseDto<{ timerId: string }>({
          status: 200,
          data: { timerId: ordId },
          message: "주문 타이머가 생성되었습니다.",
        });

        return returnValue;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : createOrdTimer
   */

  /**
   * S : validateOrdTimer
   */
  @Post("/validateOrdTimer")
  @ApiOperation({
    summary: "주문 타이머 유효성 검사",
    description: "주문 타이머를 유효성 검사한다.",
  })
  @ApiCreatedResponse({
    description: "주문 타이머를 유효성 검사한다.",
    type: String,
  })
  @ApiQuery({
    name: "timerId",
    required: true,
    description: "타이머 아이디",
    type: String,
  })
  async validateOrdTimer(
    @Query("timerId") timerId: string
  ): Promise<ResponseDto<string>> {
    try {
      const validateTimerResult = await this.ordService.validateOrdTimer(
        timerId
      );

      if (validateTimerResult) {
        let returnValue = new ResponseDto<string>({
          status: 200,
          data: "true",
          message: "주문 타이머가 유효합니다.",
        });

        return returnValue;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * S : createOrd
   */
  @Post("/createOrd")
  @ApiOperation({
    summary: "주문을 생성한다",
    description:
      "주문을 생성한다. <주문, 주문상품, 배틀러|관람객> 데이터를 생성한다.",
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
      // 주문 유효성 검사
      const validateOrdTimer = await this.ordService.validateOrdTimer(
        ord.timerId
      );

      // 주문 재고 유효성 검사
      const validateOrdStock = await this.ordService.validateOrdStock(ord);

      if (validateOrdTimer && validateOrdStock) {
        // 주문 생성
        const ordInsertResult = await this.ordService.createOrd(ord);
        // 주문 생성 결과 반환
        if (ordInsertResult) {
          let ordId = ordInsertResult.generatedMaps[0].id;
          let insertResult = new ResponseDto<{ ordId: string }>({
            status: 200,
            data: { ordId: ordId },
            message: "주문이 생성되었습니다.",
          });

          return insertResult;
        }
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
    @Query() srchOrdListDto: SrchOrdListDto,
    @Req() req: Request
  ): Promise<Pagination<OrdEntity>> {
    let session: SessionData = req.session;
    if (!session.loginUser) {
      throw new HttpException(
        "토큰이 유효하지 않습니다.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    srchOrdListDto.mbrId = session.loginUser.id;

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
    summary: "주문 결제 상세 조회",
    description: "주문 결제 상세 정보를 조회한다.",
  })
  @ApiCreatedResponse({
    description: "주문 결제 상세 정보를 조회한다.",
    type: OrdEntity,
  })
  @ApiQuery({
    name: "ordId",
    required: true,
    description: "주문 아이디",
    type: String,
  })
  async getOrdDtlById(
    @Query("ordId") ordId: string,
    @Req() req: Request
  ): Promise<OrdEntity> {
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

  /**
   * S : deleteOrd
   */
  @Post("/deleteOrd")
  @ApiOperation({
    summary: "주문 삭제",
    description: "주문아이디로 주문과 주문아이템을 논리 삭제한다.",
  })
  @ApiCreatedResponse({
    description: "주문아이디로 주문과 주문아이템을 논리 삭제한다.",
    type: OrdEntity,
  })
  @ApiQuery({
    name: "ordId",
    required: true,
    description: "주문 아이디",
    type: String,
  })
  async deleteOrd(
    @Query("ordId") ordId: string
  ): Promise<ResponseDto<{ ordId: string }>> {
    try {
      const ordDeleteResult = await this.ordService.deleteOrd(ordId);

      if (ordDeleteResult) {
        let insertResult = new ResponseDto<{ ordId: string }>({
          status: 200,
          data: { ordId: ordId },
          message: "주문이 삭제되었습니다.",
        });

        return insertResult;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
