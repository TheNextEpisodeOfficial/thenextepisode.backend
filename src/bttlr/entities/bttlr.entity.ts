import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";

@Entity("bttlr")
export class BttlrEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "배틀 참가팀 아이디" })
  @ManyToOne(() => BttlTeamEntity, (bttlTeam) => bttlTeam.id)
  @JoinColumn({ name: "bttl_team_id" })
  bttlTeamId: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 30, comment: "성명" })
  bttlrNm: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 30, comment: "댄서네임" })
  bttlrDncrNm: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 8, comment: "생년월일" })
  bttlrBirth: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 11, comment: "연락처" })
  bttlrPhn: string;
}
