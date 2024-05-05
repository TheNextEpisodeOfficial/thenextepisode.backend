import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("bttl_opt_role")
export class BttlOptRoleEntity extends CommonEntity {
  @Column({ type: "varchar", length: 36, comment: "셀럽 계정 아이디" })
  celebId;

  @Column({ type: "varchar", comment: "배틀 옵션 아이디" })
  @ManyToOne(() => BttlOptEntity, (bttlOpt) => bttlOpt.id)
  @JoinColumn({ name: "bttl_opt_id" })
  bttlOptId: string;

  @Column({ type: "varchar", length: 100, comment: "셀럽 본명" })
  roleMbrId;

  @Column({ type: "varchar", length: 100, comment: "셀럽 닉네임" })
  celebNckNm;

  @Column({ type: "varchar", length: 100, comment: "주요 역할 코드" })
  celebTypeCd;
}
