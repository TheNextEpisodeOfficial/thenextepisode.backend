import {Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Res, UseGuards} from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CartEntity } from "./entities/cart.entity";
import {CartService, ICart} from "./cart.service";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { UpdateResult } from "typeorm";
import {JwtAuthGuard} from "@src/auth/jwtAuth.guard";
/**
 * CartController : 회원 API를 관리한다
 */
@Controller("/cart")
@ApiTags("Cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}
  /**
   * 장바구니 상품 추가/업데이트
   * @param
   * @param
   * @returns
   */
  @Post("/upsertCart")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "장바구니 상품 추가/업데이트",
    description: "장바구니에 상품을 추가/업데이트 한다.",
  })
  @ApiCreatedResponse({
    description: "장바구니에 상품을 추가/업데이트 한다.",
    type: CartEntity,
  })
  async upsertCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() cartEntity: CartEntity
  ): Promise<UpdateResult> {
    cartEntity.mbrId = req.user.id;
    return this.cartService.upsertCart(cartEntity, req.user.id);
  }

  /**
   * 장바구니 상품 논리 삭제
   * @param req
   * @param res
   * @param id
   */
  @Post("/deleteCartById")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "장바구니 상품 추가/업데이트",
    description: "장바구니에 상품을 추가/업데이트 한다.",
  })
  @ApiCreatedResponse({
    description: "장바구니에 상품을 추가/업데이트 한다.",
    type: CartEntity,
  })
  async deleteCartById(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response,
      @Query("id") id: string,
  ): Promise<UpdateResult> {
    const cartEntity = new CartEntity();
    cartEntity.id = id;
    cartEntity.delYn = 'Y';

    return this.cartService.upsertCart(cartEntity, req.user.id);
  }

  /**
   * 장바구니 상품 논리 삭제
   * @param req
   */
  @Get("/getMyCartList")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "나의 장바구니 리스트 조회",
    description: "나의 장바구니 리스트를 조회한다.",
  })
  @ApiCreatedResponse({
    description: "장바구니에 상품을 추가/업데이트 한다.",
    type: CartEntity,
  })
  async getMyCartList(
      @Req() req: Request,
  ): Promise<ICart[]> {
    return this.cartService.getMyCartList(req.user.id);
  }
}
