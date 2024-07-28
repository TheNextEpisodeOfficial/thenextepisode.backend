import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SysDictItemEntity } from "@src/sys/entities/sysDictItem.entity";
import { SysService } from "@src/sys/sys.service";
import { ResponseDto } from "@src/types/response";

@Controller("/sys")
@ApiTags("System")
export class SysController {
  constructor(private readonly sysService: SysService) {}

  @Get("/getDictItemsByDictCd")
  @ApiOperation({
    summary: "사전 id로 사전 아이템 리스트 검색",
    description: "사전 Id로 사전 아이템 리스트를 검색한다.",
  })
  @ApiCreatedResponse({
    description: "사전 Id로 사전 아이템 리스트를 검색한다.",
    type: SysDictItemEntity,
  })
  async getDictItemsByDictCd(@Query("dictCd") dictCd: string) {
    const dictItemList = await this.sysService.getDictItemsByDictCd(dictCd);
    const res: ResponseDto<SysDictItemEntity[]> = {
      message: `${dictCd}에 대한 사전 아이템 리스트`,
      data: dictItemList,
      status: 200,
    };
    return res;
  }
}
