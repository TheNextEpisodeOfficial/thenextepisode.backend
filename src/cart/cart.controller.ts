import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CartEntity } from "./entities/cart.entity";
import { CartService } from "./cart.service";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { UpdateResult } from "typeorm";
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
    let session: SessionData = req.session;
    if (session.loginUser) {
      cartEntity.id = session.loginUser.id;
    }

    return this.cartService.upsertCart(cartEntity);
  }
}
