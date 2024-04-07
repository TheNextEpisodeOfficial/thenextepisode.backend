import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CelebService } from "./celeb.service";
import { CelebEntity } from "./entities/celeb.entity";

/**
 * PlnController : 플랜 테이블을 관리한다
 */
@Controller("/celeb")
@ApiTags("Celeb")
export class CelebController {
  constructor(private readonly celebService: CelebService) {}

  /**
   * S : getPlnById
   */
  @Get("/getCelebListByKeyword")
  @ApiOperation({
    summary: "키워드로 셀럽 리스트를 검색",
    description: "입력받은 키워드로 셀럽 리스트를 검색한다.",
  })
  @ApiCreatedResponse({
    description: "입력받은 키워드로 셀럽 리스트를 검색한다.",
    type: CelebEntity,
  })
  @ApiQuery({
    name: "keyword",
    required: false,
    description: "검색 키워드",
    type: String,
  })
  async getCelebListByKeyword(@Query("keyword") keyword: string) {
    return await this.celebService.getCelebListByKeyword(keyword);
  }
  /**
   * E : getPlnById
   */
}
