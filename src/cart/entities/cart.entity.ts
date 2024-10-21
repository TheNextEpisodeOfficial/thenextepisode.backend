import {
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { PLN_TYPE } from "@src/types/common.type";
import { AdncOptEntity } from "@src/adncOpt/entities/adncOpt.entity";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { Exclude, Expose } from "class-transformer";

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

  @Column({
    type: "uuid",
    comment: "입장옵션 아이디",
    nullable: true,
  })
  adncOptId: string;

  @ManyToOne(() => AdncOptEntity, (adncOpt) => adncOpt.cart)
  @JoinColumn({ name: "adnc_opt_id" })
  adncOpt: AdncOptEntity[];

  @Column({
    type: "uuid",
    comment: "배틀옵션 아이디",
    nullable: true,
  })
  bttlOptId: string;

  @ManyToOne(() => BttlOptEntity, (bttlOpt) => bttlOpt.cart)
  @JoinColumn({ name: "bttl_opt_id" })
  bttlOpt: BttlOptEntity[];
}
