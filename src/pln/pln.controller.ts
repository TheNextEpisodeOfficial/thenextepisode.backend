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
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { PlnService } from "@src/pln/pln.service";
import { SrchPlnDto } from "./dtos/pln.dto";
import { Pagination } from "nestjs-typeorm-paginate";
import { InsertResult } from "typeorm";
import { I18n, I18nContext, I18nService } from "nestjs-i18n";
import { Request } from "express";
import { SessionData } from "express-session";
import { ResponseDto } from "@src/types/response";

/**
 * PlnController : 플랜 API를 관리한다
 */
@Controller("/pln")
@ApiTags("Plan")
export class PlnController {
  constructor(private readonly plnService: PlnService) {}

  /**
   * S : getPlnDtlById
   */
  @Get("/getPlnDtlById")
  @ApiOperation({
    summary: "플랜 ID로 플랜 상세 조회",
    description: "플랜 ID로 플랜 상세를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "플랜 ID로 플랜 상세를 가져온다.",
    type: PlnEntity,
  })
  @ApiQuery({
    name: "plnId",
    required: true,
    description: "플랜 아이디",
    type: String,
  })
  async getPlnDtlById(
    @Req() req: Request,
    @Query("plnId") plnId: string,
    @I18n() i18n: I18nContext
  ) {
    let session: SessionData = req.session;
    if (!session.loginUser) {
      throw new HttpException(
        "세션이 유효하지 않습니다.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const mbrId = session.loginUser.id;
    const pln = await this.plnService.getPlnDtlById(plnId, mbrId);
    return pln;
  }
  /**
   * E : getPlnDtlById
   */

  /**
   * S : insertPln
   */
  @Post("/insertPln")
  @ApiOperation({
    summary: "플랜 생성/수정",
    description:
      "플랜을 생성 혹은 수정 하여 upsert 한다. (id가 conflict날 때 update)",
  })
  @ApiCreatedResponse({
    description: "새로운 플랜을 생성 한다.",
    type: null,
  })
  async insertPln(@Body() pln: PlnEntity): Promise<ResponseDto<InsertResult>> {
    try {
      let insertPlnResult = await this.plnService.insertPln(pln);
      if (insertPlnResult) {
        return new ResponseDto<InsertResult>({
          status: HttpStatus.CREATED,
          data: insertPlnResult,
          message: "플랜이 생성되었습니다.",
          isToast: true,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * E : insertPln
   */

  /**
   * S : srchPln
   */
  @Get("/srchPln")
  @ApiOperation({
    summary: "플랜 검색",
    description: "pln Entity로 검색하여 플랜 리스트를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "플랜 검색 결과 Response 생성.",
    type: PlnEntity,
  })
  async srchPln(@Query() pln: SrchPlnDto): Promise<Pagination<PlnEntity>> {
    return this.plnService.srchPln({
      ...pln,
      route: "/srchPln",
    });
  }
  /**
   * E : srchPln
   */
}
