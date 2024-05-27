import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * BttlTeamController : 배틀 참가팀의 API를 관리한다
 */
@Controller("/bttlTeam")
@ApiTags("bttlTeam")
export class BttlTeamController {
  constructor() {}
}
