import {SrchCommonDto, UpsertCommonDto} from "@src/config/dtos/common.dto";
export class InsertFavResDto extends UpsertCommonDto {
  plnId: string;
  mbrId: string;
}

export class DeleteFavResDto extends UpsertCommonDto {
  id: string;
}

import { Expose } from 'class-transformer';

export class FavResDto {
  @Expose()
  id: string;

  @Expose()
  plnId: string;

  @Expose()
  plnNm: string;

  @Expose()
  plnDt: string;

  @Expose()
  plnStTm: string;

  @Expose()
  plnEndTm: string;

  @Expose()
  plnRoadAddr: string;

  @Expose()
  plnAddrDtl: string;

  @Expose()
  thumb: string;

  @Expose()
  createdAt: string;

  constructor(
      id: string,
      plnId: string,
      plnNm: string,
      plnDt: string,
      plnStTm: string,
      plnEndTm: string,
      plnRoadAddr: string,
      plnAddrDtl: string,
      thumb: string,
      createdAt: string
  ) {
    this.id = id;
    this.plnId = plnId;
    this.plnNm = plnNm;
    this.plnDt = plnDt;
    this.plnStTm = plnStTm;
    this.plnEndTm = plnEndTm;
    this.plnRoadAddr = plnRoadAddr;
    this.plnAddrDtl = plnAddrDtl;
    this.thumb = thumb;
    this.createdAt = createdAt;
  }
}

export class FavReqDto extends SrchCommonDto {
  mbrId: string;
}