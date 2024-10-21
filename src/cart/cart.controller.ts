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
import { CartEntity } from "./entities/cart.entity";
import { CartService, ICart } from "./cart.service";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import {EntityManager, UpdateResult} from "typeorm";
import { JwtAuthGuard } from "@src/auth/jwtAuth.guard";
import { UpsertCartDto } from "@src/cart/dtos/cart.dto";
/**
 * CartController : 회원 API를 관리한다
 */
@Controller("/cart")
@ApiTags("Cart")
export class CartController {
  constructor(
      private readonly cartService: CartService,
      private readonly entityManager: EntityManager,
  ) {}
  @Post('/upsertCart')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '장바구니 상품 추가/업데이트',
    description: '여러 개의 상품을 트랜잭션으로 추가/업데이트한다.',
  })
  @ApiCreatedResponse({
    description: '장바구니에 상품을 추가/업데이트 한다.',
    type: [UpsertCartDto], // 배열 타입 지정
  })
  async upsertCart(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response,
      @Body() cartEntities: UpsertCartDto[], // 배열 입력
  ): Promise<UpdateResult[]> {
    const userId = req.user.id;

    try {
      // 트랜잭션 내에서 여러 상품 처리
      return await this.entityManager.transaction(async (entityManager) => {
        const results: UpdateResult[] = [];

        for (const cartEntity of cartEntities) {
          cartEntity.mbrId = userId;

          // 트랜잭션 내에서 서비스 메서드 호출
          const result = await this.cartService.upsertCart(cartEntity, userId, entityManager);

          // 오류 시 트랜잭션 강제 중단
          if (!result) {
            throw new HttpException('업데이트 실패', HttpStatus.BAD_REQUEST);
          }

          results.push(result);
        }

        return results;
      });
    } catch (error) {
      console.error('트랜잭션 오류:', error.message);
      throw new Error('장바구니 업데이트 중 오류가 발생했습니다.');
    }
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
    summary: "장바구니 상품 삭제",
    description: "장바구니에 상품을 논리 삭제한다.",
  })
  @ApiCreatedResponse({
    description: "장바구니에 상품을 논리 삭제한다.",
    type: CartEntity,
  })
  async deleteCartById(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query("id") id: string
  ): Promise<UpdateResult> {
    return this.cartService.deleteCart(id, req.user.id);
  }

  /**
   * 나의 장바구니 리스트 조회
   * @param req
   */
  @Get("/getMyCartList")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "나의 장바구니 리스트 조회",
    description: "나의 장바구니 리스트를 조회한다.",
  })
  @ApiCreatedResponse({
    description: "나의 장바구니 리스트를 조회한다.",
    type: CartEntity,
  })
  async getMyCartList(@Req() req: Request): Promise<ICart[]> {
    return this.cartService.getMyCartList(req.user.id);
  }
}
