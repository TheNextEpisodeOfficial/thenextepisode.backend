import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("mbr")
export class MbrEntity extends CommonEntity {
  @Column({ type: "varchar", length: 100, comment: "회원명" })
  mbrNm;
}
