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
import { AdncOptEntity } from "@src/adncOpt/entities/adncOpt.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";

@Entity("adnc")
export class AdncEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "입장 옵션 아이디" })
  @ManyToOne(() => AdncOptEntity, (adncOpt) => adncOpt.id)
  @JoinColumn({ name: "adnc_opt_id" })
  adncOptId: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 30, comment: "성명" })
  adncNm: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 8, comment: "생년월일" })
  adncBirth: string;

  @ApiProperty({ type: String })
  @Column({ type: "varchar", length: 11, comment: "연락처" })
  adncPhn: string;

  @OneToOne(() => OrdItemEntity, (ordItem) => ordItem.adnc)
  ordItem: OrdItemEntity;

  @OneToMany(() => TcktEntity, (tckt) => tckt.adnc)
  tckt: TcktEntity[];
}
