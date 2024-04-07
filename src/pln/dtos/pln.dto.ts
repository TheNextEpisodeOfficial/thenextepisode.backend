import { ApiProperty } from "@nestjs/swagger";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { SrchCommonDto, UpsertCommonDto } from "@src/config/dtos/common.dto";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column } from "typeorm";
import { AdncOptEntity } from "../entities/adncOpt.entity";

export class SrchPlnDto extends SrchCommonDto {
  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "플랜명" })
  plnNm;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 10, comment: "플랜타입" })
  plnTypeCd;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "플랜시작일시" })
  plnDt;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "플랜 검색 시작일" })
  plnSrchStDt;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "플랜 검색 종료일" })
  plnSrchEndDt;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "time", comment: "플랜시작시간" })
  plnStTm;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "time", comment: "플랜종료시간" })
  plnEndTm;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "장소명" })
  plnLctnNm;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "도로명 주소" })
  plnRoadAddr;

  @ApiProperty({ type: Number, required: false })
  @Column({ type: "int", comment: "총 상금" })
  plnRwrd;

  @ApiProperty({ type: Number, required: false })
  @Column({ type: "int", comment: "최대 관람객 수" })
  plnMaxCrwd;

  @ApiProperty({ type: Number, required: false })
  @Column({ type: "int", comment: "관람예매금액" })
  plnEntrFee;

  @ApiProperty({ type: Number, required: false })
  @Column({ type: "int", comment: "참가신청금액", nullable: true })
  plnJoinFee;

  @ApiProperty({ type: String, required: false })
  @Column({
    type: "varchar",
    length: 1,
    comment: "청소년 관람 및 참가 불가 여부",
  })
  rRatedYn;
}

export class UpsertPlanDto extends UpsertCommonDto {
  @ApiProperty({ type: String, required: true, default: "플랜명" })
  @Column({ type: "varchar", length: 100, comment: "플랜명" })
  plnNm;

  @ApiProperty({ type: String, required: true, default: "BTTL" })
  @Column({ type: "varchar", length: 10, comment: "플랜타입" })
  plnTypeCd;

  @ApiProperty({
    type: String,
    format: "date",
    required: true,
    default: "2024-01-01",
  })
  @Column({ type: "date", comment: "플랜시작일시" })
  plnDt;

  @ApiProperty({ type: String, required: true, default: "00:00" })
  @Column({ type: "time", comment: "플랜시작시간" })
  plnStTm;

  @ApiProperty({ type: String, required: true, default: "23:59" })
  @Column({ type: "time", comment: "플랜종료시간" })
  plnEndTm;

  @ApiProperty({ type: String, required: true, default: "도로명 주소" })
  @Column({ type: "varchar", length: 100, comment: "도로명 주소" })
  plnRoadAddr;

  @ApiProperty({ type: String, required: true, default: "상세 주소" })
  @Column({ type: "varchar", length: 1000, comment: "상세 주소" })
  plnAddrDtl;

  @ApiProperty({ type: String, required: true, default: "플랜소개" })
  @Column({ type: "varchar", length: 1000, comment: "플랜소개" })
  plnDsc;

  @ApiProperty({ type: Number, required: true, default: 0 })
  @Column({ type: "int", comment: "총 상금" })
  plnRwrd;

  @ApiProperty({ type: String, required: true, default: "2024-01-01" })
  @Column({ type: "timestamp", comment: "입장구매 마감일시" })
  plnRsvEndDt;

  @ApiProperty({ type: String, required: true, default: "2024-01-01" })
  @Column({ type: "timestamp", comment: "참가구매 마감일시" })
  bttlRsvEndDt;

  @ApiProperty({ type: String, required: true, default: "KRW" })
  @Column({ type: "varchar", length: 3, comment: "결제 화폐" })
  crncyCd;

  @ApiProperty({ type: String, required: true, default: "N" })
  @Column({
    type: "varchar",
    length: 1,
    comment: "청소년 관람 및 참가 불가 여부",
  })
  rRatedYn;

  @ApiProperty({ type: String, required: true, default: "N" })
  @Column({
    type: "varchar",
    length: 1,
    comment: "오픈 여부",
    default: "N",
  })
  opnYn;

  @ApiProperty({ type: String, required: true, default: "유튜브 채널 url" })
  @Column({
    type: "varchar",
    length: 100,
    comment: "유튜브 채널 url",
    nullable: true,
  })
  ytbUrl;

  @ApiProperty({ type: String, required: true, default: "파일그룹 아이디" })
  @Column({
    type: "varchar",
    length: 100,
    comment: "파일그룹 아이디",
    nullable: true,
  })
  fileGrpId;

  @ApiProperty({ type: [BttlOptEntity], required: false })
  bttlOpt: BttlOptEntity[];

  @ApiProperty({ type: [AdncOptEntity], required: false })
  adncOpt: AdncOptEntity[];
}
