import {
  Controller,
} from "@nestjs/common";
import {
  ApiTags,
} from "@nestjs/swagger";
import { Pagination } from "nestjs-typeorm-paginate";
import { InsertResult } from "typeorm";
import { BttlService } from "./bttl.service";

/**
 * BttlController : 배틀 관련 API를 관리한다
 */
@Controller("/bttl")
@ApiTags("Bttl")
export class BttlController {
  constructor(private readonly bttlService: BttlService) {}

  
}
