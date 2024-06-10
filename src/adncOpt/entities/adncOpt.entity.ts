import { ColumnNumericTransformer } from "@src/util/number";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { PlnEntity } from "../../pln/entities/pln.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { AdncEntity } from "@src/adnc/entities/adnc.entity";

@Entity("adnc_opt")
export class AdncOptEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "플랜 아이디" })
  @ManyToOne(() => PlnEntity, (pln) => pln.id)
  @JoinColumn({ name: "pln_id" })
  plnId: string;

  @Column({ type: "varchar", length: 100, comment: "옵션명" })
  optNm: string;

  @Column({
    type: "decimal",
    comment: "옵션가격",
    transformer: new ColumnNumericTransformer(),
  })
  optFee: number;

  @Column({
    type: "varchar",
    length: 1,
    comment: "입장비 무료 여부",
    default: "N",
  })
  freeYn: string;

  @Column({ type: "int", comment: "최대 신청 인원 (티켓 수량)" })
  maxRsvCnt: number;

  @Column({ type: "int", comment: "현재 신청 인원", default: 0 })
  crntRsvCnt: number;

  @Column({ type: "timestamp", comment: "예매 시작 일시" })
  rsvStDt;

  @Column({ type: "timestamp", comment: "예매 마감 일시" })
  rsvEndDt;

  @OneToMany(() => OrdItemEntity, (ordItem) => ordItem.adncOpt)
  ordItem: OrdItemEntity[];

  @OneToMany(() => OrdItemEntity, (ordItem) => ordItem.adncOpt)
  adnc: AdncEntity[];
}
