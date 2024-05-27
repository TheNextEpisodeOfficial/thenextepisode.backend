import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * AdncController : 플랜 관람객의 API를 관리한다
 */
@Controller("/adnc")
@ApiTags("Adnc")
export class AdncController {
  constructor() {}
}
