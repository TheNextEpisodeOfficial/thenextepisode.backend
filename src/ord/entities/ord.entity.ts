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
import { ColumnNumericTransformer } from "@src/util/transformer";

@Entity("ord")
export class OrdEntity extends CommonEntity {
  // 회원 ID
  @Column({ type: "uuid", comment: "플랜 아이디" })
  ordMbrId: string;

  // 주문 번호
  @ApiProperty({ type: String, required: true, default: "주문번호" })
  @Column({ type: "varchar", length: 36, comment: "주문번호" })
  ordNum: string;

  // 주문 상태
  @ApiProperty({ type: String, required: true, default: "PENDING" })
  @Column({ type: "varchar", length: 10, comment: "상태", default: "PENDING" })
  ordStt: string;

  // 총 주문 금액
  @ApiProperty({ type: Number, required: true, default: 10000 })
  @Column({
    type: "decimal",
    comment: "총 주문금액",
    transformer: new ColumnNumericTransformer(),
  })
  totalOrdAmt: number;

  // 총 결제 금액
  @ApiProperty({ type: Number, required: true, default: 8000 })
  @Column({
    type: "decimal",
    comment: "총 주문금액",
    transformer: new ColumnNumericTransformer(),
  })
  totalPayAmt: number;

  // 총 할인 금액
  @ApiProperty({ type: Number, required: true, default: 2000 })
  @Column({
    type: "decimal",
    comment: "총 할인금액",
    transformer: new ColumnNumericTransformer(),
  })
  totalDscntAmt: number;

  // 주문 항목
  @OneToMany(() => OrdItemEntity, (ordItem) => ordItem.ord)
  ordItem: OrdItemEntity[];

  // 주문 결제 정보
  @OneToOne(() => OrdPaymentEntity, (ordPayment) => ordPayment.ord)
  ordPayment: OrdPaymentEntity;

  @ManyToOne(() => MbrEntity, (mbr) => mbr.ord)
  @JoinColumn({ name: "ord_mbr_id" })
  mbr: MbrEntity;

  timerId: string;
}
