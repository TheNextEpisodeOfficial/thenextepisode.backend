import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";
import { ColumnNumericTransformer } from "@src/util/transformer";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";

@Entity("bttl_opt")
export class BttlOptEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "플랜 아이디" })
  plnId: string;

  @ApiProperty({ type: String, required: false, default: "BRKN" })
  @Column({ type: "varchar", length: 10, comment: "장르 타입 코드" })
  bttlGnrCd: string;

  @ApiProperty({ type: String, required: false })
  @Column({
    type: "varchar",
    length: 100,
    comment: "배틀 룰 (7 to smoke, Non locker 등)",
    nullable: true,
  })
  bttlRule: string;

  @ApiProperty({ type: String, required: false, default: "N" })
  @Column({ type: "int", comment: "팀 최대정원" })
  bttlMbrCnt: number;

  @Column({
    type: "decimal",
    comment: "참가 금액",
    transformer: new ColumnNumericTransformer(),
  })
  bttlRsvFee: number;

  @Column({ type: "varchar", length: 1, comment: "믹시드 여부" })
  mxdYn: string;

  @Column({
    type: "varchar",
    length: 1,
    comment: "참가비 무료 여부",
    default: "N",
  })
  freeYn: string;

  @Column({ type: "int", comment: "최대 신청 팀 수" })
  maxRsvCnt: number;

  @Column({ type: "int", comment: "현재 신청 팀수", default: 0 })
  crntRsvCnt: number;

  @Column({ type: "timestamp", comment: "예매 시작 일시" })
  rsvStDt;

  @Column({ type: "timestamp", comment: "예매 마감 일시" })
  rsvEndDt;

  @OneToMany(() => BttlOptRoleEntity, (role) => role.bttlOpt)
  bttlOptRole: BttlOptRoleEntity[];

  @OneToMany(() => OrdItemEntity, (ordItem) => ordItem.bttlOpt)
  ordItem: OrdItemEntity[];

  @ManyToOne(() => PlnEntity, (pln) => pln.bttlOpt)
  @JoinColumn({ name: "pln_id" })
  pln: PlnEntity;

  optTit: string;
}
