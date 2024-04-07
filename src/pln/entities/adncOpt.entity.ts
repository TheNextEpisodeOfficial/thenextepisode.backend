import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("adnc_opt")
export class AdncOptEntity extends CommonEntity {
  @Column({ type: "varchar", length: 36, comment: "플랜 아이디" })
  plnId: string;

  @Column({ type: "varchar", length: 100, comment: "옵션명" })
  optNm: string;

  @Column({ type: "int", comment: "옵션가격" })
  optPrc: number;

  @Column({ type: "int", comment: "최대 신청 인원 (티켓 수량)" })
  optMaxRsvCnt: number;
}
