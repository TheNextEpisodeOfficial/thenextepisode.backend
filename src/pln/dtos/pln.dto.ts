import { ApiProperty } from "@nestjs/swagger";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { SrchCommonDto } from "@src/config/dtos/common.dto";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { Column } from "typeorm";
import { AdncOptEntity } from "../../adncOpt/entities/adncOpt.entity";

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
