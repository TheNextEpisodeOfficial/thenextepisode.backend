import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { PlnEntity } from "../../pln/entities/pln.entity";

@Entity("adnc_opt")
export class AdncOptEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "플랜 아이디" })
  @ManyToOne(() => PlnEntity, (pln) => pln.id)
  @JoinColumn({ name: "pln_id" })
  plnId: string;

  @Column({ type: "varchar", length: 100, comment: "옵션명" })
  optNm: string;

  @Column({ type: "int", comment: "옵션가격" })
  optPrc: number;

  @Column({ type: "int", comment: "최대 신청 인원 (티켓 수량)" })
  optMaxRsvCnt: number;
}
