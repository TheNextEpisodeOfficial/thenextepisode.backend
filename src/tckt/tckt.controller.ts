import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { I18n, I18nContext } from "nestjs-i18n";
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
    description: "멤버 아이디를 기준으로 보유중인 티켓을 가져온다.",
  })
  @ApiCreatedResponse({
    description: "멤버 아이디를 기준으로 보유중인 티켓을 가져온다.",
    type: TcktEntity,
  })
  @ApiParam({
    name: "mbrId",
    required: true,
    description: "멤버 아이디",
    type: String,
  })
  async getMyTckts(@Query("mbrId") mbrId: string, @I18n() i18n: I18nContext) {
    const tckts = await this.tcktService.getMyTckts(mbrId);
    return tckts;
  }
  /**
   * E : getMyTckts
   */
}
