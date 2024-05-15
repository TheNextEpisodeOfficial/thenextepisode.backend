import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { CelebEntity } from "@src/celeb/entities/celeb.entity";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("bttl_opt_role")
export class BttlOptRoleEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "배틀 옵션 아이디" })
  bttlOptId: string;

  @Column({
    type: "varchar",
    comment: "역할이 멤버일 경우의 celeb.id",
    nullable: true,
  })
  roleCelebId;

  @Column({
    type: "varchar",
    comment: "역할이 멤버일 경우의 mbr.id",
    nullable: true,
  })
  roleMbrId;

  @Column({ type: "varchar", length: 3, comment: "주요 역할 코드" })
  roleInPln;

  @ManyToOne(() => BttlOptEntity, (bttlOpt) => bttlOpt.bttlOptRole)
  @JoinColumn({ name: "bttl_opt_id" })
  bttlOpt: BttlOptEntity;

  @ManyToOne(() => CelebEntity, (celeb) => celeb.bttlOptRole)
  @JoinColumn({ name: "role_celeb_id" })
  celeb: CelebEntity;

  @ManyToOne(() => MbrEntity, (mbr) => mbr.bttlOptRole)
  @JoinColumn({ name: "role_mbr_id" })
  mbr: MbrEntity;
}
