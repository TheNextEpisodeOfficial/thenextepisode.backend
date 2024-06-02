import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { AdncEntity } from "@src/adnc/entities/adnc.entity";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { BttlrEntity } from "@src/bttlr/entities/bttlr.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";

@Entity("tckt")
export class TcktEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "주문상품 아이디" })
  ordItemId: string;

  @Column({ type: "uuid", comment: "배틀러 아이디" })
  bttlrId: string;

  @Column({ type: "uuid", comment: "관람객 아이디" })
  adncId: string;

  @Column({ type: "uuid", comment: "티켓 소지 계정 아이디" })
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

  @ApiProperty({ type: String })
  @Column({
    type: "uuid",
    comment: "시크릿 키",
  })
  secretKey: string;

  @ApiProperty({ type: String })
  @Column({
    type: "varchar",
    length: 8,
    comment: "티켓 상태",
    default: "PENDING",
  })
  tcktStt: string;

  @ManyToOne(() => BttlrEntity, (bttlr) => bttlr.tckt)
  @JoinColumn({ name: "bttlr_id" })
  bttlr: BttlrEntity;

  @ManyToOne(() => AdncEntity, (adnc) => adnc.tckt)
  @JoinColumn({ name: "adnc_id" })
  adnc: AdncEntity;

  @ManyToOne(() => MbrEntity, (mbr) => mbr.tckt)
  @JoinColumn({ name: "tckt_hld_mbr_id" })
  mbr: MbrEntity;

  @OneToOne(() => OrdItemEntity, (ordItem) => ordItem.tckt)
  @JoinColumn({ name: "ord_item_id" })
  ordItem;
}
