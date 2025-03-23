import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {InsertResult, Repository, UpdateResult} from "typeorm";
import { FavEntity } from "./entities/fav.entity";
import { objectToCamel } from "ts-case-convert";
import {FavResDto, FavReqDto, InsertFavResDto} from "@src/fav/dtos/fav.dto";
import {paginate, Pagination} from "nestjs-typeorm-paginate";
import {TicketListDto} from "@src/tckt/dtos/tckt.dto";
import {plainToInstance} from "class-transformer";
import {getBttlOptTit} from "@src/util/system";

@Injectable()
export class FavService {
  constructor(
    @InjectRepository(FavEntity)
    private readonly favRepository: Repository<FavEntity>
  ) {}

  /**
   * 관심있는 리스트 조회
   * @param favReqDto
   */
  async getFavList(
      favReqDto: FavReqDto,
  ): Promise<Pagination<FavResDto>> {
      try {
          const { mbrId } = favReqDto;

          // 1단계: ID만 가져와서 페이지네이션 처리
          const idQueryBuilder = this.favRepository
              .createQueryBuilder("fav")
              .select("fav.id")
              .where("fav.mbrId = :mbrId", { mbrId })
              .andWhere("fav.delYn = :delYn", { delYn: "N" })
              .orderBy("fav.createdAt", "DESC");

          const favIdsPaginated = await paginate<{ id: string }>(
              idQueryBuilder,
              favReqDto
          );

          if (!favIdsPaginated.items.length) {
              return new Pagination<FavResDto>([], favIdsPaginated.meta);
          }

          // 2단계: 페이지네이션된 ID 목록에 대한 상세 정보 조회
          const fullQueryBuilder = this.favRepository
              .createQueryBuilder("fav")
              .select([
                  "fav.id AS id",
                  "fav.createdAt AS created_at",
                  "pln.id AS pln_id",
                  "pln.plnDt AS pln_dt",
                  "pln.plnStTm AS pln_st_tm",
                  "pln.plnEndTm AS pln_end_tm",
                  "pln.plnTypeCd AS pln_type_cd",
                  "pln.plnNm AS pln_nm",
                  "pln.plnRoadAddr AS pln_road_addr",
                  "pln.plnAddrDtl AS pln_addr_dtl",
                  "file.fileNm AS thumb",
              ])
              .leftJoin("fav.pln", "pln")
              .leftJoin("pln.file", "file")
              .where("fav.id IN (:...ids)", {
                  ids: favIdsPaginated.items.map((item) => item.id),
              })
              .andWhere("fav.delYn = :delYn", { delYn: "N" })
              .andWhere("file.fileTypeCd = :fileTypeCd", { fileTypeCd: "THMB_MN" })
              .orderBy("fav.createdAt", "DESC");

          const favList = await fullQueryBuilder.getRawMany();

          // 결과를 DTO로 변환
          const favResults = plainToInstance(FavResDto, favList);

          return new Pagination<FavResDto>(favResults, favIdsPaginated.meta);

      } catch (error) {
          throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  /**
   * 관심있는 플랜 추가
   * @param favDto
   * @param mbrId
   */
  async insertFavById(
    favDto: InsertFavResDto,
    mbrId: string
  ): Promise<InsertResult | UpdateResult> {
    try {
      const existItem = await this.favRepository.findOne({
        where: { plnId: favDto.plnId, mbrId: mbrId },
      });

      if (existItem) {
        return this.favRepository.update({ id: existItem.id }, {
          delYn: 'N'
        })
      } else {
        return this.favRepository.insert(favDto);
      }

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 관심있는 풀랸 삭제
   * @param plnId
   * @param mbrId
   */
  async deleteFavById(plnId, mbrId) {
    try {
      const existItem = await this.favRepository.findOne({
        where: { plnId: plnId, mbrId: mbrId },
      });
      if (!existItem) {
        throw new HttpException(
          "해당 찜한 플랜 데이터가 존재하지 않습니다.",
          HttpStatus.BAD_REQUEST
        );
      } else if (existItem.mbrId != mbrId) {
        throw new HttpException(
          "해당 찜한 플랜 데이터에 대한 권한이 없습니다.",
          HttpStatus.UNAUTHORIZED
        );
      } else {
        return this.favRepository.update({ id: existItem.id }, { delYn: "Y" });
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
