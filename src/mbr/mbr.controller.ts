import { Controller, Get, Req, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { MbrEntity } from "./entities/mbr.entity";
import { MbrService } from "./mbr.service";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { JoinUser } from "./types/mbr.types";

@Controller("/mbr")
export class MbrController {
  constructor(private readonly mbrService: MbrService) {}

  /**
   * S : getJoinInfo
   */
  @Get("/getJoinInfo")
  async getJoinInfo(@Req() req: Request): Promise<JoinUser> {
    let session: SessionData = req.session;
    return session.user;
  }
  /**
   * E : getJoinInfo
   */
}
