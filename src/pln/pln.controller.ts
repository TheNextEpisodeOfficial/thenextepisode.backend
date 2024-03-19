import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { response } from "@src/types/response";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { PlnService } from "@src/pln/pln.service";
import { SrchPlnDto, UpsertPlanDto } from "./dtos/pln.dto";
import { Pagination } from "nestjs-typeorm-paginate";
import { InsertResult } from "typeorm";

/**
 * PlnController : 플랜 테이블을 관리한다
 */
@Controller("/pln")
@ApiTags("Plan")
export class PlnController {
  constructor(private readonly plnService: PlnService) {}

  /**
   * S : getPlnById
   */
  @Get("/getPlnById")
  @ApiOperation({
    summary: "플랜 ID로 플랜 상세 조회",
    description: "플랜 ID로 플랜 상세를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "플랜 ID로 플랜 상세를 가져온다.",
    type: PlnEntity,
  })
  @ApiParam({
    name: "plnId",
    required: true,
    description: "플랜 아이디",
    type: String,
  })
  async getPlnById(@Query("plnId") plnId) {
    const pln = await this.plnService.getPlnById(plnId);
    let res: response<PlnEntity>;
    let title: string = "";
    let message: string;
    if (pln) {
      message = "검색 성공";
    } else {
      title = "해당 플랜이 없습니다.";
      message = "새로운 플랜을 등록해보시는건 어떨까요?";
    }
    res = {
      title: title,
      message: message,
      data: pln,
      status: 200,
    };

    return res;
  }
  /**
   * E : getPlnById
   */

  /**
   * S : upsrtPln
   */
  @Post("/upsrtPln")
  @ApiOperation({
    summary: "플랜 생성/수정",
    description:
      "플랜을 생성 혹은 수정 하여 upsert 한다. (id가 conflict날 때 update)",
  })
  @ApiCreatedResponse({
    description: "새로운 플랜을 생성 한다.",
    type: null,
  })
  upsrtPln(@Body() pln: UpsertPlanDto) {
    try {
      let upsrtPlnRslt = this.plnService.upsrtPln(pln);
      const response: response<Promise<InsertResult>> = {
        message: "플랜을 성공적으로 등록하였습니다.",
        data: upsrtPlnRslt,
        status: 200,
      };
      return response;
    } catch (e) {
      console.error(e);
    }
  }
  /**
   * E : upsrtPln
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
