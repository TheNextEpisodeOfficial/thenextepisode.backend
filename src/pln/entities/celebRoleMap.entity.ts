import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("celeb_role_map")
export class CelebRoleMapEntity extends CommonEntity {
  @Column({ type: "varchar", length: 36, comment: "셀럽 아이디" })
  celebId;

  @Column({ type: "varchar", length: 36, comment: "배틀 옵션 아이디" })
  bttlOptId;

  @Column({ type: "varchar", length: 36, comment: "회원 아이디" })
  roleUserId;

  @Column({ type: "varchar", length: 3, comment: "플랜 내 역할 타입" })
  celebPlanRole;
}
