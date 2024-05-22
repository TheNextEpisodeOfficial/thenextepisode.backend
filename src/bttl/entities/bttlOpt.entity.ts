import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";

@Entity("bttl_opt")
export class BttlOptEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "플랜 아이디" })
  @ManyToOne(() => PlnEntity, (pln) => pln.id)
  @JoinColumn({ name: "pln_id" })
  plnId: string;

  @ApiProperty({ type: String, required: false, default: "BRKN" })
  @Column({ type: "varchar", length: 10, comment: "장르 타입 코드" })
  bttlGnrCd: string;

  @ApiProperty({ type: String, required: false })
  @Column({
    type: "varchar",
    length: 20,
    comment: "배틀 룰 (7 to smoke, Non locker 등)",
    nullable: true,
  })
  bttlRule: string;

  @ApiProperty({ type: String, required: false, default: "N" })
  @Column({ type: "int", comment: "팀 최대정원" })
  bttlMbrCnt: number;

  @Column({ type: "decimal", comment: "참가 금액" })
  bttlRsvFee: number;

  @Column({ type: "varchar", length: 1, comment: "믹시드 여부" })
  mxdYn: string;

  @Column({ type: "int", comment: "최대 신청 팀 수" })
  maxTeamCnt: number;

  @Column({ type: "int", comment: "현재 신청 팀수", default: 0 })
  crntTeamCnt: number;

  @Column({
    type: "varchar",
    length: 1,
    comment: "참가비 무료 여부",
    default: "N",
  })
  freeYn: string;

  @OneToMany(() => BttlOptRoleEntity, (role) => role.bttlOpt)
  bttlOptRole: BttlOptRoleEntity[];
}
