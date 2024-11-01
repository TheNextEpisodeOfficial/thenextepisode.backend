import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";

@Entity("celeb")
export class CelebEntity extends CommonEntity {
  @Index()
  @Column({ type: "varchar", length: 100, comment: "셀럽 본명" })
  celebNm;

  @Index()
  @Column({ type: "varchar", length: 30, comment: "셀럽 닉네임" })
  celebNckNm;

  @Column({ type: "varchar", length: 4, comment: "주요 역할 코드" })
  celebTypeCd;

  @Column({ type: "varchar", length: 4, comment: "주요 장르 코드" })
  celebMnJnr;

  @OneToMany(() => BttlOptRoleEntity, (bttlOptRole) => bttlOptRole.celeb)
  bttlOptRole: BttlOptRoleEntity;
}
