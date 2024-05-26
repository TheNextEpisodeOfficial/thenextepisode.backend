import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AdncEntity } from "@src/adnc/entities/adnc.entity";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";

@Entity("bttlr")
export class BttlrEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "배틀러 아이디" })
  @ManyToOne(() => BttlrEntity, (bttlr) => bttlr.id)
  @JoinColumn({ name: "bttlr_id" })
  bttlrId: string;

  @Column({ type: "varchar", comment: "관람객 아이디" })
  @ManyToOne(() => AdncEntity, (adnc) => adnc.id)
  @JoinColumn({ name: "adnc_id" })
  adncId: string;

  @Column({ type: "varchar", comment: "티켓 소지 계정 아이디" })
  @ManyToOne(() => MbrEntity, (mbr) => mbr.id)
  @JoinColumn({ name: "tckt_hld_mbr_id" })
  tcktHldMbrId: string;

  @ApiProperty({ type: String })
  @Column({
    type: "varchar",
    length: 1,
    comment: "팀원 양도 완료 여부",
    default: "N",
  })
  teamAsgnYn: string;

  @ApiProperty({ type: String })
  @Column({
    type: "varchar",
    length: 1,
    comment: "타인 양도 완료 여부",
    default: "N",
  })
  hndOvrYn: string;

  @ApiProperty({ type: String })
  @Column({
    type: "varchar",
    length: 1,
    comment: "사용 완료 여부",
    default: "N",
  })
  usedYn: string;
}
