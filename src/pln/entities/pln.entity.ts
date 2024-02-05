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

  @Column({ type: "varchar", length: 100, comment: "장소명" })
  plnLctnNm;

  @Column({ type: "varchar", length: 100, comment: "도로명 주소" })
  plnRoadAddr;

  @Column({ type: "varchar", length: 1000, comment: "상세 주소" })
  plnAddrDtl;

  @Column({ type: "varchar", length: 1000, comment: "플랜소개" })
  plnDsc;

  @Column({ type: "varchar", length: 1000, comment: "플랜 룰", nullable: true })
  plnRule;

  @Column({ type: "int", comment: "총 상금" })
  plnRwrd;

  @Column({ type: "int", comment: "최대 관람객 수" })
  plnMaxCrwd;

  @Column({ type: "int", comment: "관람예매금액" })
  plnEntrFee;

  @Column({ type: "int", comment: "참가신청금액", nullable: true })
  plnJoinFee;

  @Column({
    type: "varchar",
    length: 1,
    comment: "청소년 관람 및 참가 불가 여부",
  })
  rRatedYn;

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
