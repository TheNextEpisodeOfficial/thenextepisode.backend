import { AdncEntity } from "@src/adnc/entities/adnc.entity";
import { AdncOptEntity } from "@src/adncOpt/entities/adncOpt.entity";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { ColumnNumericTransformer } from "@src/util/transformer";

@Entity("ord_item")
export class OrdItemEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "플랜 아이디" })
  ordId: string;

  @Column({ type: "uuid", comment: "배틀옵션 아이디", nullable: true })
  bttlOptId: string;

  @Column({ type: "uuid", comment: "입장옵션 아이디", nullable: true })
  adncOptId: string;

  @Column({
    type: "decimal",
    comment: "판매금액",
    transformer: new ColumnNumericTransformer(),
  })
  ordAmt;

  @Column({
    type: "decimal",
    comment: "결제금액",
    transformer: new ColumnNumericTransformer(),
  })
  payAmt;

  @Column({
    type: "decimal",
    comment: "할인금액",
    transformer: new ColumnNumericTransformer(),
  })
  dscntAmt;

  @Column({ type: "int", comment: "구매수량" })
  qty;

  @Column({
    type: "varchar",
    length: 1,
    comment: "클레임 여부",
    default: "N",
  })
  claimYn: string;

  @Column({
    type: "decimal",
    comment: "클레임 금액",
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  claimAmt: number;

  @ManyToOne(() => OrdEntity, (ord) => ord.ordItem)
  @JoinColumn({ name: "ord_id" })
  ord: OrdEntity;

  @OneToOne(() => BttlTeamEntity, (bttlTeam) => bttlTeam.ordItem)
  bttlTeam: BttlTeamEntity;

  @OneToMany(() => AdncEntity, (adnc) => adnc.ordItem)
  adnc: AdncEntity[];

  @OneToMany(() => TcktEntity, (tckt) => tckt.ordItem)
  tckt: TcktEntity;

  @ManyToOne(() => BttlOptEntity, (bttlOpt) => bttlOpt.ordItem)
  @JoinColumn({ name: "bttl_opt_id" })
  bttlOpt: BttlOptEntity;

  @ManyToOne(() => AdncOptEntity, (adncOpt) => adncOpt.ordItem)
  @JoinColumn({ name: "adnc_opt_id" })
  adncOpt: AdncOptEntity;
}
