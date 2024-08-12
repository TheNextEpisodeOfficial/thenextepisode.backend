import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { MbrEntity } from "./entities/mbr.entity";
import { MbrService } from "./mbr.service";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { InsertResult, UpdateResult } from "typeorm";

/**
 * MbrController : 회원 API를 관리한다
 */
@Controller("/mbr")
@ApiTags("Mbr")
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
    summary: "회원 정보 수정",
    description: "회원의 정보를 수정한다.",
  })
  @ApiCreatedResponse({
    description: "회원의 정보를 수정한다.",
    type: null,
  })
  async updateMbr(@Body() mbr: MbrEntity): Promise<UpdateResult> {
    return this.mbrService.updateMbr(mbr);
  }
  /**
   * E : updateMbr
   */

  /**
   * S : BlockMbr
   */
  @Post("/blockMbr")
  @ApiOperation({
    summary: "회원 차단",
    description: "회원를 차단한다.",
  })
  @ApiCreatedResponse({
    description: "회원를 차단한다.",
    type: null,
  })
  @ApiBody({
    description: "회원 아이디",
    required: true,
    schema: {
      type: "object",
      properties: {
        mbrId: { type: "string" },
      },
    },
  })
  async blockMbr(@Body("mbrId") mbrId: string): Promise<UpdateResult> {
    return this.mbrService.blockMbr(mbrId);
  }
  /**
   * E : BlockMbr
   */

  /**
   * S : withdrawMbr
   */
  @Post("/withdrawMbr")
  @ApiOperation({
    summary: "회원 탈퇴",
    description: "회원를 탈퇴한다.",
  })
  @ApiCreatedResponse({
    description: "회원를 탈퇴한다.",
    type: null,
  })
  @ApiBody({
    description: "회원 아이디",
    required: true,
    schema: {
      type: "object",
      properties: {
        mbrId: { type: "string" },
      },
    },
  })
  async withdrawMbr(@Body("mbrId") mbrId: string): Promise<UpdateResult> {
    return this.mbrService.withdrawMbr(mbrId);
  }
  /**
   * E : withdrawMbr
   */

  /**
   * S : recoverMbr
   */
  @Post("/recoverMbr")
  @ApiOperation({
    summary: "회원 복구",
    description: "회원를 복구한다.",
  })
  @ApiCreatedResponse({
    description: "회원를 복구한다.",
    type: null,
  })
  @ApiBody({
    description: "회원 아이디",
    required: true,
    schema: {
      type: "object",
      properties: {
        mbrId: { type: "string" },
      },
    },
  })
  async recoverMbr(@Body("mbrId") mbrId: string): Promise<UpdateResult> {
    return this.mbrService.recoverMbr(mbrId);
  }
  /**
   * E : recoverMbr
   */
}
