import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req, UnauthorizedException,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { PlnService } from "@src/pln/pln.service";
import { SrchPlnDto } from "./dtos/pln.dto";
import { Pagination } from "nestjs-typeorm-paginate";
import { InsertResult } from "typeorm";
import { I18n, I18nContext } from "nestjs-i18n";
import { Request } from "express";
import { ResponseDto } from "@src/types/response";
import { JwtService } from "@nestjs/jwt";
import * as process from "process";

/**
 * PlnController : 플랜 API를 관리한다
 */
@Controller("/pln")
@ApiTags("Plan")
export class PlnController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly plnService: PlnService
  ) {}

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
    try{
      // FIXME : guard에 걸릴 필요는 없으나 로그인에 따라 선택적으로 로직이 변경되는 경우 구현 필요
      let payload = {
        id: "",
      };
      if (req.cookies.accessToken) {
        payload = this.jwtService.verify(req.cookies.accessToken, {
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        });
      }

      return await this.plnService.getPlnDtlById(plnId, payload.id);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // 토큰 만료 예외를 명시적으로 던짐
        throw new UnauthorizedException('액세스 토큰이 만료되었습니다.');
      } else {
        // 그 외의 에러는 그대로 처리
        return error
      }
    }
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

  /**
   * S : srchPln
   */
  @Get("/getPlndPln")
  @ApiOperation({
    summary: "내가 기획한 플랜 리스트",
    description: "내가 기획한 플랜 리스트를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "내가 기획한 플랜 리스트를 가져온다.",
    type: PlnEntity,
  })
  async getPlndPln(@Query() pln: SrchPlnDto): Promise<Pagination<PlnEntity>> {
    return this.plnService.srchPln({
      ...pln,
      route: "/srchPln",
    });
  }
  /**
   * E : srchPln
   */
}
