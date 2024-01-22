import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { MbrService } from "./mbr.service";

@Controller("/mbr")
export class MbrController {
  constructor(private readonly mbrService: MbrService) {}
}
