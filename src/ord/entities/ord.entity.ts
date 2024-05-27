import { ApiProperty } from "@nestjs/swagger";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("ord")
export class OrdEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "플랜 아이디" })
  @ManyToOne(() => MbrEntity, (mbr) => mbr.id)
  @JoinColumn({ name: "ord_mbr_id" })
  ordMbrId: string;

  @ApiProperty({ type: String, required: true, default: "주문번호" })
  @Column({ type: "varchar", length: 36, comment: "주문번호" })
  ordNum;

  @ApiProperty({ type: String, required: true, default: "DONE" })
  @Column({ type: "varchar", length: 10, comment: "상태" })
  ordStt;

  @ApiProperty({ type: Number, required: true, default: 10000 })
  @Column({ type: "decimal", comment: "총 주문금액" })
  totalOrdAmt;

  @ApiProperty({ type: Number, required: true, default: 8000 })
  @Column({ type: "decimal", comment: "총 주문금액" })
  totalPayAmt;

  @ApiProperty({ type: Number, required: true, default: 2000 })
  @Column({ type: "decimal", comment: "총 할인금액" })
  totalDscntAmt;

  @OneToMany(() => OrdItemEntity, (ordItem) => ordItem.ord)
  ordItem: OrdItemEntity[];
}
