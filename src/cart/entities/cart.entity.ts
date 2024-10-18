import {BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { PLN_TYPE } from "@src/types/common.type";
import { AdncOptEntity } from "@src/adncOpt/entities/adncOpt.entity";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import {Exclude, Expose} from "class-transformer";

@Entity("cart")
export class CartEntity extends CommonEntity {
  @Column({
    type: "uuid",
    comment: "멤버 아이디",
  })
  mbrId: string;

  @Column({
    type: "int",
    comment: "수량",
  })
  qty: number;

  @ManyToOne(() => MbrEntity, (mbr) => mbr.ord)
  @JoinColumn({ name: "mbr_id" })
  mbr: MbrEntity;

  @OneToOne(() => AdncOptEntity, (adncOpt) => adncOpt.cart)
  @JoinColumn({ name: "adnc_opt_id" })
  adncOpt: AdncOptEntity;

  @Column({
    type: "uuid",
    comment: "입장 옵션 id",
    nullable: true
  })
  adncOptId: string;

  @OneToOne(() => BttlOptEntity, (bttlOpt) => bttlOpt.cart)
  @JoinColumn({ name: "bttl_opt_id" })
  bttlOpt: BttlOptEntity;

  @Column({
    type: "uuid",
    comment: "참가 옵션 id",
    nullable: true
  })
  bttlOptId: string;
}
