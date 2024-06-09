import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { I18n, I18nContext } from "nestjs-i18n";
import { TicketListDto } from "./dtos/tckt.dto";
import { TcktEntity } from "./entities/tckt.entity";
import { TcktService } from "./tckt.service";

/**
 * TcktController : 티켓 API를 관리한다
 */
@Controller("/tckt")
@ApiTags("tckt")
export class TcktController {
  constructor(private readonly tcktService: TcktService) {}
  /**
   * S : getMyTckts
   */
  @Get("/getMyTckts")
  @ApiOperation({
    summary: "보유 티켓 조회",
    description: "멤버 아이디를 기준으로 보유중인 티켓 리스트를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "멤버 아이디를 기준으로 보유중인 티켓 리스트를 가져온다.",
    type: TcktEntity,
  })
  @ApiParam({
    name: "mbrId",
    required: true,
    description: "멤버 아이디",
    type: String,
  })
  async getMyTckts(
    @Req() req: Request,
    @Query("mbrId") mbrId: string,
    @I18n() i18n: I18nContext
  ) {
    // let session: SessionData = req.session;
    // console.log("session:::", session);
    const tckts = await this.tcktService.getMyTckts(mbrId);
    return tckts;
  }
  /**
   * E : getMyTckts
   */

  /**
   * S : getTcktDtlById
   */
  @Get("/getTcktDtlById")
  @ApiOperation({
    summary: "티켓 아이디로 티켓 상세 조회",
    description: "티켓 아이디를 기준으로 티켓 상세정보를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "티켓 아이디를 기준으로 티켓 상세정보를 가져온다.",
    type: TicketListDto,
  })
  @ApiQuery({
    name: "tcktId",
    required: true,
    description: "티켓 아이디",
    type: String,
  })
  async getTcktDtlById(
    @Query("tcktId") tcktId: string,
    @I18n() i18n: I18nContext
  ) {
    try {
      const tcktDtl = await this.tcktService.getTcktDtlById(tcktId);
      return tcktDtl;
    } catch (err) {
      return err;
    }
  }
  /**
   * E : getTcktDtlById
   */

  /**
   * S : useTcktById
   */
  @Get("/useTcktById")
  @ApiOperation({
    summary: "티켓 아이디로 티켓을 사용처리",
    description: "티켓 아이디로 티켓을 사용처리 한다.",
  })
  @ApiCreatedResponse({
    description: "티켓 아이디로 티켓을 사용처리 한다.",
    type: TicketListDto,
  })
  @ApiQuery({
    name: "tcktId",
    required: true,
    description: "티켓 아이디",
    type: String,
  })
  async useTcktById(
    @Res({ passthrough: true }) res: Response,
    @Query("tcktId") tcktId: string,
    @I18n() i18n: I18nContext
  ) {
    try {
      const tcktDtl = await this.tcktService.useTcktById(tcktId);
      if (tcktDtl.affected === 1) {
        return {
          status: 200,
          message: "성공",
        };
      } else {
        return {
          status: 500,
          message: "실패",
        };
      }
    } catch (err) {
      return err;
    }
  }
  /**
   * E : useTcktById
   */
}
