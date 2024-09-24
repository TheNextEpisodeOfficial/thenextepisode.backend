import { Column, Entity, OneToMany } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { SysDictItemEntity } from "@src/sys/entities/sysDictItem.entity";

@Entity("sys_dict")
export class SysDictEntity extends CommonEntity {
  @Column({ type: "varchar", length: 100, comment: "사전명" })
  dictNm;

  @Column({ type: "varchar", length: 100, comment: "사전코드" })
  dictCd;

  @Column({ type: "varchar", length: 100, comment: "사전설명" })
  dictDesc;

  @OneToMany(() => SysDictItemEntity, (dictItem) => dictItem.dict)
  dictItem: SysDictItemEntity[];
}
