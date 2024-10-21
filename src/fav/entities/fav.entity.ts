import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { PlnEntity } from "@src/pln/entities/pln.entity";

@Entity("fav")
export class FavEntity extends CommonEntity {
  @Column({
    type: "uuid",
    comment: "멤버 아이디",
  })
  mbrId: string;

  @ManyToOne(() => MbrEntity, (mbr) => mbr.ord)
  @JoinColumn({ name: "mbr_id" })
  mbr: MbrEntity;

  @Column({
    type: "uuid",
    comment: "플랜 아이디",
  })
  plnId: string;

  @OneToMany(() => PlnEntity, (pln) => pln.fav)
  @JoinColumn({ name: "pln_id" })
  pln: PlnEntity;
}
