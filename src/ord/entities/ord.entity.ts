import { ApiProperty } from "@nestjs/swagger";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { OrdPaymentEntity } from "@src/ordPayment/entities/ordPayment.entity";

@Entity("ord")
export class OrdEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "플랜 아이디" })
  @ManyToOne(() => MbrEntity, (mbr) => mbr.id)
  @JoinColumn({ name: "ord_mbr_id" })
  ordMbrId: string;

  @ApiProperty({ type: String, required: true, default: "주문번호" })
  @Column({ type: "varchar", length: 36, comment: "주문번호" })
  ordNum: string;

  @ApiProperty({ type: String, required: true, default: "PENDING" })
  @Column({ type: "varchar", length: 10, comment: "상태", default: "PENDING" })
  ordStt: string;

  @ApiProperty({ type: Number, required: true, default: 10000 })
  @Column({ type: "decimal", comment: "총 주문금액" })
  totalOrdAmt: number;

  @ApiProperty({ type: Number, required: true, default: 8000 })
  @Column({ type: "decimal", comment: "총 주문금액" })
  totalPayAmt: number;

  @ApiProperty({ type: Number, required: true, default: 2000 })
  @Column({ type: "decimal", comment: "총 할인금액" })
  totalDscntAmt: number;

  @OneToMany(() => OrdItemEntity, (ordItem) => ordItem.ord)
  ordItem: OrdItemEntity[];

  @OneToOne(() => OrdPaymentEntity, (ordPayment) => ordPayment.ord)
  @JoinColumn({ name: "ord_id" })
  ordPayment: OrdPaymentEntity;
}
