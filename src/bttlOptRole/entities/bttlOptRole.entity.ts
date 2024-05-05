import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("bttl_opt_role")
export class BttlOptRoleEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "배틀 옵션 아이디" })
  @ManyToOne(() => BttlOptEntity, (bttlOpt) => bttlOpt.id)
  @JoinColumn({ name: "bttl_opt_id" })
  bttlOptId: string;

  @Column({
    type: "varchar",
    length: 36,
    comment: "역할이 멤버일 경우의 celeb.id",
    nullable: true,
  })
  roleCelebId;

  @Column({
    type: "varchar",
    length: 36,
    comment: "역할이 멤버일 경우의 mbr.id",
    nullable: true,
  })
  roleMbrId;

  @Column({ type: "varchar", length: 3, comment: "주요 역할 코드" })
  roleInPln;

  @ManyToOne(() => BttlOptEntity, (bttlOpt) => bttlOpt.bttlOptRole)
  bttlOpt: BttlOptEntity;
}
