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

  // 회원 약관동의 수정
  async upsertCart(cartEntity: CartEntity): Promise<UpdateResult> {
    try {
      return await this.cartRepository.upsert(cartEntity, ["id"]);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
