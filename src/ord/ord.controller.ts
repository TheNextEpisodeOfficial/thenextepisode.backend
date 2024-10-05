import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
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
import dayjs from "dayjs";
import { JwtService } from "@nestjs/jwt";
import * as process from "process";
import { JwtAuthGuard } from "@src/auth/jwtAuth.guard";
import {KakaoAuthGuard} from "@src/auth/guard";

/**
 * OrdController : 주문 API를 관리한다
 */
@Controller("/ord")
@ApiTags("Order")
export class OrdController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly ordService: OrdService
  ) {}

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
        let timer = createTimerResult.generatedMaps[0];
        let returnValue = new ResponseDto<{
          timerId: string;
          timerExpire: string;
        }>({
          status: HttpStatus.CREATED,
          data: {
            timerId: timer.id,
            timerExpire: dayjs(timer.createdAt)
              .add(10, "minute")
              .format("YYYY-MM-DD HH:mm:ss"),
          },
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
  @UseGuards(JwtAuthGuard)
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
    @Body() ord: OrdEntity,
    @Req() req: Request
  ): Promise<ResponseDto<{ ordId: string }>> {
    try {
      ord.ordMbrId = req.user.id;
      console.log("req.user:", req.user);
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
  @UseGuards(JwtAuthGuard)
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
    console.log(req.cookies.accessToken);
    const payload = this.jwtService.verify(req.cookies.accessToken, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    });

    try {
      const ordList = await this.ordService.getOrdList({
        ...srchOrdListDto,
        mbrId: payload.id,
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
  @Post("/softDeleteOrd")
  @ApiOperation({
    summary: "주문 삭제 (논리)",
    description: "주문아이디로 주문과 주문아이템을 논리 삭제한다.",
  })
  @ApiCreatedResponse({
    type: null,
    description: "주문아이디로 주문과 주문아이템을 논리 삭제한다.",
  })
  @ApiQuery({
    name: "ordId",
    required: true,
    description: "주문 아이디",
    type: String,
  })
  async softDeleteOrd(
    @Query("ordId") ordId: string
  ): Promise<ResponseDto<{ ordId: string }>> {
    try {
      const ordDeleteResult = await this.ordService.softDeleteOrd(ordId);

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
