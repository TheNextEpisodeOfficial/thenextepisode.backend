import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";

@Entity("bttlr")
export class BttlrEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "배틀 참가팀 아이디" })
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

  @ManyToOne(() => BttlTeamEntity, (bttlTeam) => bttlTeam.bttlr)
  @JoinColumn({ name: "bttl_team_id" })
  bttlTeam: BttlTeamEntity;

  @OneToMany(() => TcktEntity, (tckt) => tckt.bttlr)
  tckt: TcktEntity[];
}
