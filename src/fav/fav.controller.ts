import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FavEntity } from "./entities/fav.entity";
import { FavService, IFav } from "./fav.service";
import { Request, Response } from "express";
import { UpdateResult } from "typeorm";
import { JwtAuthGuard } from "@src/auth/jwtAuth.guard";
import { DeleteFavDto, InsertFavDto } from "@src/fav/dtos/fav.dto";
/**
 * CartController : 회원 API를 관리한다
 */
@Controller("/fav")
@ApiTags("Favorite")
export class FavController {
  constructor(private readonly favService: FavService) {}
  /**
   * 찜한 상품 추가
   * @param
   * @param
   * @returns
   */
  @Post("/insertFavById")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "찜한 플랜 추가",
    description: "찜한플랜에 플랜을 추가 한다.",
  })
  @ApiCreatedResponse({
    description: "찜한플랜에 플랜을 추가 한다.",
    type: FavEntity,
  })
  async insertFavById(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() insertFavDto: InsertFavDto
  ): Promise<UpdateResult> {
    insertFavDto.mbrId = req.user.id;
    insertFavDto.createdBy = req.user.id;
    return this.favService.insertFavById(insertFavDto, req.user.id);
  }

  /**
   * 장바구니 상품 논리 삭제
   * @param req
   * @param res
   * @param id
   */
  @Post("/deleteFavById")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "관심있는 플랜 삭제",
    description: "관심있는 플랜을 id기준으로 논리 삭제한다.",
  })
  @ApiCreatedResponse({
    description: "관심있는 플랜을 id기준으로 논리 삭제한다.",
    type: FavEntity,
  })
  async deleteFavById(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query("id") id: string
  ): Promise<UpdateResult> {
    const mbrId = req.user.id;
    return this.favService.deleteFavById(id, mbrId);
  }

  /**
   * 찜한 플랜 리스트 조회
   * @param req
   */
  @Get("/getFavList")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "찜한 플랜 리스트 조회",
    description: "찜한 플랜 리스트를 조회한다.",
  })
  @ApiCreatedResponse({
    description: "찜한 플랜을 추가/업데이트 한다.",
    type: FavEntity,
  })
  async getFavList(@Req() req: Request): Promise<IFav[]> {
    return this.favService.getFavList(req.user.id);
  }
}
