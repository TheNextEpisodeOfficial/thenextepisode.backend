import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("celeb")
export class CelebEntity extends CommonEntity {
  @Column({ type: "varchar", length: 100, comment: "셀럽 본명" })
  celebNm;

  @Column({ type: "varchar", length: 100, comment: "셀럽 닉네임" })
  celebNckNm;

  @Column({ type: "varchar", length: 100, comment: "주요 역할 코드" })
  celebTypeCd;
}
