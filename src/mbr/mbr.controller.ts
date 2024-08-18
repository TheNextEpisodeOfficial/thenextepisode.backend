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
  ApiTags,
} from "@nestjs/swagger";
import { MbrEntity } from "./entities/mbr.entity";
import { MbrService } from "./mbr.service";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { InsertResult, UpdateResult } from "typeorm";
import { JoinMbrDto, UpsertMbrAgreeDto, UpsertMbrDto } from "./dtos/mbr.dto";
import axios from "axios";
import { AuthService } from "@src/auth/auth.service";

/**
 * MbrController : 회원 API를 관리한다
 */
@Controller("/mbr")
@ApiTags("Mbr")
export class MbrController {
  constructor(
    private readonly authService: AuthService,
    private readonly mbrService: MbrService
  ) {}

  private readonly DATA_URL = "https://kapi.kakao.com/v2/user/me";

  /**
   * 회원 정보 조회
   * @param req
   * @returns
   */
  @Get("/getJoinInfo")
  async getJoinInfo(@Req() req: Request): Promise<MbrEntity> {
    let session: SessionData = req.session;
    return session.joinUser;
  }

  /**
   * 회원 가입
   * @param mbr
   * @returns
   */
  @Post("/joinMbr")
  @ApiOperation({
    summary: "회원 가입 정보 등록",
    description: "회원 가입 정보를 등록한다. (가입완료 시점)",
  })
  @ApiCreatedResponse({
    description: "회원 가입 정보를 등록한다. (가입완료 시점)",
    type: UpdateResult,
  })
  @ApiBody({
    description: "회원 정보",
    required: true,
    type: JoinMbrDto,
  })
  async joinMbr(@Body() joinMbrDto: JoinMbrDto): Promise<UpdateResult> {
    return this.mbrService.joinMbr(joinMbrDto);
  }

  /**
   * 회원 정보 수정
   * @param mbr
   * @returns
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
  async updateMbr(@Body() mbr: UpsertMbrDto): Promise<UpdateResult> {
    return this.mbrService.updateMbr(mbr);
  }

  /**
   * 회원 차단
   * @param mbrId
   * @returns
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
   * 회원 탈퇴
   * @param mbrId
   * @returns
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
   * 회원 복구
   * @param mbrId
   * @returns
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
   * 회원 약관동의 정보 수정
   * @param req
   * @param upsertMbrAgreeDto
   * @returns
   */
  @Post("/updateMbrAgree")
  @ApiOperation({
    summary: "회원 약관동의 정보 수정",
    description: "회원의 약관동의 정보를 수정한다.",
  })
  @ApiCreatedResponse({
    description: "회원의 약관동의 정보를 수정한다.",
    type: null,
  })
  async updateMbrAgree(
    @Req() req: Request,
    @Body() upsertMbrAgreeDto: UpsertMbrAgreeDto
  ): Promise<UpdateResult> {
    const useTempToken = upsertMbrAgreeDto.useTempToken;

    let session: SessionData = req.session;
    let tempMbr = null;
    if (useTempToken) {
      const userInfo = await axios.get(this.DATA_URL, {
        headers: {
          Authorization: `Bearer ${session.tempToken.accessToken}`,
        },
      });
      tempMbr = await this.authService.getUserInfo(userInfo.data.id);
    }

    const mbrId = useTempToken ? tempMbr.id : session.loginUser.id;

    return this.mbrService.updateMbrAgree(mbrId, upsertMbrAgreeDto);
  }
}
