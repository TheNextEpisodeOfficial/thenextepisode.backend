import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository, UpdateResult } from "typeorm";
import { CartEntity } from "./entities/cart.entity";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>
  ) {}

  // 장바구니 목록 가져오기
  async getMyCartList() {}

  // 장바구니 upsert
  async upsertCart(cartEntity: CartEntity): Promise<UpdateResult> {
    try {
      return await this.cartRepository.upsert(cartEntity, ["id"]);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
