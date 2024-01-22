import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("pln")
export class PlnEntity extends CommonEntity {
  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "플랜명" })
  plnNm;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 10, comment: "플랜타입" })
  plnTypeCd;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "플랜시작일시" })
  plnDt;

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

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 1000, comment: "상세 주소" })
  plnAddrDtl;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 1000, comment: "플랜소개" })
  plnDsc;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 1000, comment: "플랜 룰", nullable: true })
  plnRule;

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

  @ApiProperty({ type: String, required: false })
  @Column({
    type: "varchar",
    length: 100,
    comment: "파일그룹 아이디",
    nullable: true,
  })
  fileGrpId;
}
