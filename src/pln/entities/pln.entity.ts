import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("pln")
export class PlnEntity extends CommonEntity {
  @Column({ type: "varchar", length: 100, comment: "플랜명" })
  plnNm;

  @Column({ type: "varchar", length: 10, comment: "플랜타입" })
  plnTypeCd;

  @Column({ type: "date", comment: "플랜시작일시" })
  plnDt;

  @Column({ type: "time", comment: "플랜시작시간" })
  plnStTm;

  @Column({ type: "time", comment: "플랜종료시간" })
  plnEndTm;

  @Column({ type: "varchar", length: 100, comment: "도로명 주소" })
  plnRoadAddr;

  @Column({ type: "varchar", length: 1000, comment: "상세 주소" })
  plnAddrDtl;

  @Column({ type: "varchar", length: 1000, comment: "플랜소개" })
  plnDsc;

  @Column({ type: "int", comment: "총 상금" })
  plnRwrd;

  @Column({ type: "timestamp", comment: "입장구매 마감일시" })
  plnRsvEndDt;

  @Column({ type: "timestamp", comment: "참가구매 마감일시" })
  bttlRsvEndDt;

  @Column({ type: "varchar", length: 3, comment: "결제 화폐" })
  crncyCd;

  @Column({
    type: "varchar",
    length: 1,
    comment: "청소년 관람 및 참가 불가 여부",
  })
  rRatedYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "플랜상세에서의 참가자현황 공개 여부",
  })
  showBttlrYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "오픈 여부",
    default: "N",
  })
  opnYn;

  @Column({
    type: "varchar",
    length: 100,
    comment: "유튜브 채널 url",
    nullable: true,
  })
  ytbUrl;

  @Column({
    type: "varchar",
    length: 100,
    comment: "파일그룹 아이디",
    nullable: true,
  })
  fileGrpId;
}
