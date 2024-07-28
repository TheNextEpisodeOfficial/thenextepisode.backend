import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
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
    @Query("plnId") plnId: string,
    @I18n() i18n: I18nContext
  ) {
    const pln = await this.plnService.getPlnDtlById(plnId);
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
  async insertPln(@Body() pln: PlnEntity): Promise<InsertResult> {
    try {
      let insertPlanResult = await this.plnService.insertPln(pln);
      if (insertPlanResult) {
        return insertPlanResult;
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
