import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { CelebService } from "@src/celeb/celeb.service";
import { CelebEntity } from "@src/celeb/entities/celeb.entity";
import { MbrService } from "@src/mbr/mbr.service";

/**
 * BttlOptRoleController : 배틀 옵션으로 등록되는 DJ, MC, JUDGE 를 관리한다.
 */
@Controller("/bttlOptRole")
@ApiTags("BttlOptRole")
export class BttlOptRoleController {
  constructor(
    private readonly celebService: CelebService,
    private readonly mbrService: MbrService
  ) {}

  /**
   * S : getPlnById
   */
  @Get("/getBttlOptRoleByKeyword")
  @ApiOperation({
    summary: "키워드로 셀럽 리스트를 검색",
    description: "입력받은 키워드로 셀럽 리스트와 멤버 리스트를 검색한다.",
  })
  @ApiCreatedResponse({
    description: "입력받은 키워드로 셀럽 리스트와 멤버 리스트를 검색한다.",
    type: BttlOptEntity,
  })
  @ApiQuery({
    name: "keyword",
    required: false,
    description: "검색 키워드",
    type: String,
  })
  async getCelebListByKeyword(@Query("keyword") keyword: string) {
    let celebList = await this.celebService.getCelebListByKeyword(keyword);
    let mbrList = await this.mbrService.getMbrListByKeyword(keyword);
    return {
      celebList: celebList,
      mbrList: mbrList
    }
  }
  /**
   * E : getPlnById
   */
}
