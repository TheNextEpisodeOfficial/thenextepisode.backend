import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { CartEntity } from "./entities/cart.entity";
import {objectToCamel} from "ts-case-convert";
import {getBttlOptTit} from "@src/util/system";

export interface ICart {
  id: string;
  qty: number;
  sort: number;
  optNm: string;
  bttlGnrCd: string;
  bttlRule: string;
  bttlMbrCnt: number;
  plnNm: string;
  thumb: string;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>
  ) {}

  /**
   * 나의 장바구니 리스트 조회
   * @param mbrId
   */
  async getMyCartList(mbrId): Promise<ICart[]> {
    try {
      const cartRawList = await this.cartRepository
          .createQueryBuilder('cart')
          .select([
            'cart.id AS id',
            'cart.qty AS qty',
            'cart.createdAt AS created_at',
            'adncOpt.optNm as opt_nm',
            'bttlOpt.bttlGnrCd AS bttl_gnr_cd',
            'bttlOpt.bttlRule AS bttl_rule',
            'bttlOpt.bttlMbrCnt AS bttl_mbr_cnt',
            `COALESCE(adncPln.plnNm, bttlPln.plnNm) AS pln_nm`,
            `COALESCE(adncFile.fileNm, bttlFile.fileNm) AS thumb`,
          ])
          .leftJoin('cart.adncOpt', 'adncOpt')
          .leftJoin('adncOpt.pln', 'adncPln')
          .leftJoin('cart.bttlOpt', 'bttlOpt')
          .leftJoin('bttlOpt.pln', 'bttlPln')
          .leftJoin('bttlPln.file', 'bttlFile')
          .leftJoin('adncPln.file', 'adncFile')
          .where('cart.mbrId = :mbrId', { mbrId })
          .andWhere('cart.delYn = :delYn', { delYn: 'N' })
          .orderBy('cart.createdAt', 'DESC')
          .getRawMany<ICart>();

      const cartList = objectToCamel(cartRawList);
      cartList.map((cart) => {
        if(!cart.optNm) {
          cart.optNm = getBttlOptTit({
            bttlGnrCd: cart.bttlGnrCd,
            bttlRule: cart.bttlRule,
            bttlMbrCnt: cart.bttlMbrCnt
          });
        }

        delete cart.bttlGnrCd;
        delete cart.bttlRule;
        delete cart.bttlMbrCnt;
      })

      return cartList;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  /**
   * 장바구니 UPSERT
   * @param cartEntity
   * @param mbrId
   */
  async upsertCart(cartEntity: CartEntity, mbrId: string): Promise<UpdateResult> {
    try {
      if(!cartEntity.id) {
        // INSERT
        return await this.cartRepository.insert({
          ...cartEntity,
          createdBy: mbrId
        });
      } else {
        // UPDATE
        const cart = await this.cartRepository.findOne({
          where: {
            id: cartEntity.id,
            delYn: 'N',
          }
        })

        // S : 장바구니 유효성 체크
        if(cartEntity.delYn != 'Y') {
          if(!cartEntity.qty || cartEntity.qty === 0) {
            throw new HttpException(
                '장바구니 상품의 갯수는 0개일 수 없습니다.',
                HttpStatus.BAD_REQUEST
            );
          } else if(cart.bttlOptId && cartEntity.qty > 1) {
            throw new HttpException(
                '참가 상품의 갯수는 1개를 초과할 수 없습니다.',
                HttpStatus.BAD_REQUEST
            );
          }
          else if(cart.adncOptId && cartEntity.qty > 2) {
            throw new HttpException(
                '입장 상품의 갯수는 2개를 초과할 수 없습니다.',
                HttpStatus.BAD_REQUEST
            );
          }
        }
        // E : 장바구니 유효성 체크

        return await this.cartRepository.update({
          id: cartEntity.id
        }, {
          ...cart,
          ...cartEntity,
          updatedBy: mbrId
        });
      }

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
