import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
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
import { SrchTcktListDto, TicketListDto } from "./dtos/tckt.dto";
import { TcktEntity } from "./entities/tckt.entity";
import { TcktService } from "./tckt.service";
import { ResponseDto } from "@src/types/response";
import { JwtAuthGuard } from "@src/auth/jwtAuth.guard";

/**
 * TcktController : 티켓 API를 관리한다
 */
@Controller("/tckt")
@ApiTags("Tckt")
export class TcktController {
  constructor(private readonly tcktService: TcktService) {}
  /**
   * S : getMyTckts
   */
  @Get("/getMyTckts")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "보유 티켓 조회",
    description: "멤버 아이디를 기준으로 보유중인 티켓 리스트를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "멤버 아이디를 기준으로 보유중인 티켓 리스트를 가져온다.",
    type: TcktEntity,
  })
  async getMyTckts(
    @Req() req: Request,
    @Query() srchTcktListDto: SrchTcktListDto,
    @I18n() i18n: I18nContext
  ) {
    srchTcktListDto.mbrId = req.user.id;
    const tckts = await this.tcktService.getMyTckts(srchTcktListDto);
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
    const tcktDtl = await this.tcktService.useTcktById(tcktId);
    if (tcktDtl.affected === 1) {
      return new ResponseDto({
        status: 200,
        message: "티켓 사용처리가 완료되었습니다.",
      });
    }
  }
  /**
   * E : useTcktById
   */
}
