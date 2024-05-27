import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { MbrEntity } from "./entities/mbr.entity";
import { MbrService } from "./mbr.service";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { InsertResult, UpdateResult } from "typeorm";

/**
 * MbrController : 회원 API를 관리한다
 */
@Controller("/mbr")
export class MbrController {
  constructor(private readonly mbrService: MbrService) {}

  /**
   * S : getJoinInfo
   */
  @Get("/getJoinInfo")
  async getJoinInfo(@Req() req: Request): Promise<MbrEntity> {
    let session: SessionData = req.session;
    return session.joinUser;
  }
  /**
   * E : getJoinInfo
   */

  /**
   * S : updateMbr
   */
  @Post("/updateMbr")
  @ApiOperation({
    summary: "멤버 정보 수정",
    description: "멤버의 정보를 수정한다.",
  })
  @ApiCreatedResponse({
    description: "멤버의 정보를 수정한다.",
    type: null,
  })
  async updateMbr(@Body() mbr: MbrEntity): Promise<UpdateResult> {
    return this.mbrService.updateMbr(mbr);
  }
  /**
   * E : updateMbr
   */
}
