import { ApiProperty } from "@nestjs/swagger";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AdncOptEntity } from "@src/adncOpt/entities/adncOpt.entity";

@Entity("adnc")
export class AdncEntity extends CommonEntity {
  @Column({ type: "varchar", comment: "입장 옵션 아이디" })
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
}
