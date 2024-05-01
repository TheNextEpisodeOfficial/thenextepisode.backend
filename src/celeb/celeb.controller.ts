import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CelebService } from "./celeb.service";
import { CelebEntity } from "./entities/celeb.entity";
import { MbrService } from "@src/mbr/mbr.service";

/**
 * PlnController : 플랜 테이블을 관리한다
 */
@Controller("/celeb")
@ApiTags("Celeb")
export class CelebController {
  constructor(
    private readonly celebService: CelebService,
    private readonly mbrService: MbrService
  ) {}


}
