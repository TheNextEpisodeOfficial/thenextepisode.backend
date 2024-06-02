import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";
import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";
import { BttlrEntity } from "@src/bttlr/entities/bttlr.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";

@Entity("bttl_team")
export class BttlTeamEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "배틀 옵션 아이디" })
  bttlOptId: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 30, comment: "팀명" })
  bttlTeamNm: string;

  @ApiProperty({ type: String })
  @Column({
    type: "varchar",
    length: 4,
    comment: "결과 타입 코드",
    nullable: true,
  })
  rsltTypeCd: string;

  @OneToMany(() => BttlrEntity, (bttlr) => bttlr.bttlTeam, {
    cascade: true,
  })
  bttlr: BttlrEntity[];

  @OneToOne(() => OrdItemEntity, (ordItem) => ordItem.bttlTeam)
  ordItem: OrdItemEntity;
}
