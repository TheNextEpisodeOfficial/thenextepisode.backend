import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { CartEntity } from "./entities/cart.entity";
import {objectToCamel} from "ts-case-convert";
import {getBttlOptTit} from "@src/util/system";
import {UpsertCartDto} from "@src/cart/dtos/cart.dto";

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
    private readonly cartRepository: Repository<CartEntity>,
) {}

  private readonly MAX_BTTL_TCKT_CNT = 1;
  private readonly MAX_ADNC_TCKT_CNT = 2;
  private readonly MAX_CART_ITEM_CNT = 20;

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
  async upsertCart(cartDto: UpsertCartDto, mbrId: string): Promise<UpdateResult> {
    try {
      // S : 최대 갯수 유효성 체크
      const totalQty = await this.cartRepository.count({
        where: {
          mbrId: mbrId,
          delYn: 'N'
        }
      })

      if(totalQty > this.MAX_CART_ITEM_CNT) {
        throw new HttpException(
            `장바구니 상품 종류는 최대 ${this.MAX_CART_ITEM_CNT}개까지만 담을 수 있습니다.`,
            HttpStatus.UNPROCESSABLE_ENTITY
        );
      }
      // E : 최대 갯수 유효성 체크

      if(!cartDto.id) { // cart id가 없으므로 플랜 상세에서 옵션 선택 후 장바구니 클릭한 케이스
        cartDto.consciousUpdate = cartDto.consciousUpdate || false;
        // 중복 아이템 조회
        let existItem:CartEntity;

        if (cartDto.bttlOptId) {
          // bttlOptId가 있는 경우
          existItem = await this.cartRepository.findOne({
            where: {
              mbrId: mbrId,
              delYn: 'N',
              bttlOptId: cartDto.bttlOptId,
            },
          });
        } else {
          // bttlOptId가 없는 경우 adncOptId로 조회
          existItem = await this.cartRepository.findOne({
            where: {
              mbrId: mbrId,
              delYn: 'N',
              adncOptId: cartDto.adncOptId,
            },
          });
        }

        if(existItem && existItem.id) {
          // S : 중복된 bttlOptId나 adncOptId가 있으면 update
          return this.updateCart(cartDto, existItem, mbrId);
          // E : 중복된 bttlOptId나 adncOptId가 있으면 update
        } else {
          // S : 중복 아이템 없으므로 새로운 카트 아이템 INSERT
          return await this.cartRepository.insert({
            ...cartDto,
            createdBy: mbrId
          });
          // E : 중복 아이템 없으므로 새로운 카트 아이템 INSERT
        }

      } else {
        // UPDATE
        cartDto.consciousUpdate = true; // 요청 엔터티에 ID가 존재하므로 의도적인 업데이트로 판단 (+, - 버튼 클릭)

        // 중복 아이템 조회
        const existItem = await this.cartRepository.findOne({
          where: {
            id: cartDto.id,
            delYn: 'N',
          }
        })

        if(!existItem.id) {
          throw new HttpException('해당 장바구니 상품이 존재하지 않습니다.', HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return this.updateCart(cartDto, existItem, mbrId);
      }

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCart(cartDto, existItem, mbrId) {
    // S : 장바구니 유효성 체크
    if(cartDto.delYn != 'Y') { // deleteCart API 가 아니면
      if((existItem.bttlOptId && existItem.qty >= this.MAX_BTTL_TCKT_CNT) || (existItem.adncOptId && existItem.qty >= this.MAX_ADNC_TCKT_CNT)) {
        throw new HttpException(
            '이미 최대수량만큼 장바구니에 담겨있습니다.',
            HttpStatus.BAD_REQUEST
        );
      }

      // 의도적인 업데이트가 아니고 관객 옵션 상품을 더 추가할 수 있는 경우
      if(!cartDto.consciousUpdate && (existItem.adncOptId && existItem.qty < this.MAX_ADNC_TCKT_CNT)) {
        throw new HttpException(
            {
              message: '해당 상품이 이미 장바구니에 존재합니다. 수량을 추가할까요?',
              currentQty: existItem.qty
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }


      if(!cartDto.qty || cartDto.qty === 0) {
        throw new HttpException(
            '장바구니 상품의 갯수는 0개일 수 없습니다.',
            HttpStatus.BAD_REQUEST
        );
      } else if(existItem.bttlOptId && cartDto.qty > this.MAX_BTTL_TCKT_CNT) {
        throw new HttpException(
            `참가 상품의 갯수는 ${this.MAX_BTTL_TCKT_CNT}개를 초과할 수 없습니다.`,
            HttpStatus.BAD_REQUEST
        );
      }
      else if(existItem.adncOptId && cartDto.qty > this.MAX_ADNC_TCKT_CNT) {
        throw new HttpException(
            `입장 상품의 갯수는 ${this.MAX_ADNC_TCKT_CNT}개를 초과할 수 없습니다.`,
            HttpStatus.BAD_REQUEST
        );
      }
    }
    // E : 장바구니 유효성 체크

    return await this.cartRepository.update({
      id: cartDto.id
    }, {
      ...existItem,
      bttlOptId: cartDto.bttlOptId,
      adncOptId: cartDto.adncOptId,
      qty: cartDto.qty,
      updatedBy: mbrId
    });
  }
}

