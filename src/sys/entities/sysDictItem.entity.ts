import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { SysDictEntity } from "./sysDict.entity";
import { CelebEntity } from "@src/celeb/entities/celeb.entity";

@Entity("sys_dict_item")
export class SysDictItemEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "사전 id" })
  dictId;

  @Column({ type: "varchar", length: 100, comment: "사전 아이템 코드" })
  dictItemCd;

  @Column({ type: "varchar", length: 100, comment: "사전 아이템 텍스트" })
  dictItemTxt;

  @Column({ type: "varchar", length: 100, comment: "사전 아이템 설명" })
  dictItemDesc;

  @ManyToOne(() => SysDictEntity, (dict) => dict.dictItem)
  @JoinColumn({ name: "dict_id" })
  dict: SysDictEntity;
}
