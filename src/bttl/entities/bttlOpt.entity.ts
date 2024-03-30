import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("bttl_opt")
export class BttlOptEntity extends CommonEntity {
  @Column({ type: "varchar", length: 36, comment: "플랜 아이디" })
  plnId;

  @Column({ type: "varchar", length: 10, comment: "장르 타입 코드" })
  bttlGnrCd;

  @Column({ type: "int", comment: "팀 최대정원" })
  bttlMbrCnt;

  @Column({ type: "decimal", comment: "참가 금액" })
  bttlRsvFee;

  @Column({ type: "varchar", length: 1, comment: "믹시드 여부" })
  mxdYn;

  @Column({ type: "int", comment: "최대 신청 팀 수" })
  maxTeamCnt;
}
