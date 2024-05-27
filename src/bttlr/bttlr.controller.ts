import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * BttlrController : 배틀 참가자의 API를 관리한다
 */
@Controller("/bttlr")
@ApiTags("bttlr")
export class BttlrController {
  constructor() {}
}
