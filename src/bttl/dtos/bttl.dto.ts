import { ApiProperty } from "@nestjs/swagger";
import { UpsertCommonDto } from "@src/config/dtos/common.dto";
import { Column } from "typeorm";
export class BttlOptDto extends UpsertCommonDto {
  @Column({ type: "varchar", length: 36, comment: "플랜 아이디" })
  plnId: string;

  @ApiProperty({ type: String, required: false, default: "BTTL" })
  @Column({ type: "varchar", length: 10, comment: "장르 타입 코드" })
  bttlGnrCd: string;

  @ApiProperty({ type: String, required: false, default: "N" })
  @Column({ type: "int", comment: "팀 최대정원" })
  bttlMbrCnt: number;

  @Column({ type: "decimal", comment: "참가 금액" })
  bttlRsvFee: number;

  @Column({ type: "varchar", length: 1, comment: "믹시드 여부" })
  mxdYn: string;

  @Column({ type: "int", comment: "최대 신청 팀 수" })
  maxTeamCnt: number;
}
