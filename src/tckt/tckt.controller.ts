import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * TcktController : 티켓 API를 관리한다
 */
@Controller("/tckt")
@ApiTags("tckt")
export class TcktController {
  constructor() {}
}
