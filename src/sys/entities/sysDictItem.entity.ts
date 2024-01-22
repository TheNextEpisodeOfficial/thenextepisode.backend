import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { SysDictEntity } from "./sysDict.entity";

@Entity("sys_dict_item")
export class SysDictItemEntity extends CommonEntity {
  @ManyToOne((type) => SysDictEntity, (dict) => dict.id)
  @Column({ type: "varchar", length: 100, comment: "사전 id" })
  @JoinColumn({ name: "dictId" })
  dictId;

  @Column({ type: "varchar", length: 100, comment: "사전 아이템 코드" })
  dictItemCd;

  @Column({ type: "varchar", length: 100, comment: "사전 아이템 텍스트" })
  dictItemTxt;

  @Column({ type: "varchar", length: 100, comment: "사전 아이템 설명" })
  dictItemDesc;
}
