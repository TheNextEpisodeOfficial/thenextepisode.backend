import { ApiProperty } from "@nestjs/swagger";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import {
  ColumnNumericTransformer,
  getCardCompanyNameTransformer,
} from "@src/util/transformer";

@Entity("ord_payment")
export class OrdPaymentEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "주문 아이디" })
  orderId: string;

  @ApiProperty({ type: String, required: true, default: "주문명" })
  @Column({ type: "varchar", length: 500, comment: "주문명" })
  orderName;

  @ApiProperty({ type: String, required: true, default: "결제 KEY" })
  @Column({ type: "varchar", length: 200, comment: "토스페이 주문아이디" })
  orderNum: string;

  @ApiProperty({ type: String, required: true, default: "결제 구분코드" })
  @Column({ type: "varchar", length: 10, comment: "결제 구분코드" })
  paymentTypeCd: string;

  @ApiProperty({
    type: String,
    default: "결제수단",
  })
  @Column({
    type: "varchar",
    comment: "결제수단",
  })
  method: string;

  @ApiProperty({ type: String, required: true, default: "상점 아이디" })
  @Column({ type: "varchar", length: 100, comment: "상점 아이디" })
  mId;

  @ApiProperty({ type: String, required: true, default: "최종주문 KEY" })
  @Column({ type: "varchar", length: 64, comment: "최종주문 KEY" })
  lastTransactionKey: string;

  @ApiProperty({ type: String, required: true, default: "결제 KEY" })
  @Column({ type: "varchar", length: 200, comment: "결제 KEY" })
  paymentKey;

  @ApiProperty({ type: Number, required: true, default: "과세제외금액" })
  @Column({
    type: "decimal",
    comment: "과세제외금액",
    transformer: new ColumnNumericTransformer(),
  })
  taxExemptionAmount;

  @ApiProperty({ type: String, required: true, default: "상태" })
  @Column({ type: "varchar", length: 20, comment: "상태" })
  status;

  @ApiProperty({ type: String, required: true, default: "요청일시" })
  @Column({ type: "timestamp", comment: "요청일시" })
  requestedAt;

  @ApiProperty({ type: String, required: true, default: "승인일시" })
  @Column({ type: "timestamp", comment: "승인일시" })
  approvedAt;

  @ApiProperty({ type: Boolean, required: true, default: "에스크로 여부" })
  @Column({ type: "boolean", comment: "에스크로 여부" })
  useEscrow;

  // @ApiProperty({ type: String, required: true, default: "TID(결제승인번호)" })
  // @Column({ type: "varchar", length: 100, comment: "TID(결제승인번호)" })
  // tId;

  /**
   * S : Spread Card Object
   */
  @ApiProperty({
    type: Number,
    default: "카드사 결제 요청 금액",
  })
  @Column({
    type: "decimal",
    comment: "카드사 결제 요청 금액",
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  cardAmount;

  @ApiProperty({
    type: String,
    required: false,
    default: "카드 발급사 숫자코드",
  })
  @Column({
    type: "varchar",
    length: 100,
    comment: "카드 발급사 숫자코드",
    nullable: true,
    transformer: new getCardCompanyNameTransformer(),
  })
  cardIssuerCode;

  @ApiProperty({
    type: String,
    required: false,
    default: "카드 매입사 숫자코드",
  })
  @Column({
    type: "varchar",
    length: 100,
    comment: "카드 매입사 숫자코드",
    nullable: true,
  })
  cardAcquirerCode;

  @ApiProperty({ type: String, required: false, default: "카드번호" })
  @Column({ type: "varchar", length: 100, comment: "카드번호", nullable: true })
  cardNumber;

  @ApiProperty({ type: Number, required: false, default: "할부 개월 수" })
  @Column({ type: "int", comment: "할부 개월 수", nullable: true })
  cardInstallmentPlanMonths;

  @ApiProperty({ type: String, required: false, default: "카드사 승인 번호" })
  @Column({
    type: "varchar",
    length: 10,
    comment: "카드사 승인 번호",
    nullable: true,
  })
  cardApproveNo;

  @ApiProperty({
    type: String,
    required: false,
    default: "카드 종류 (신용, 체크, 기프트, 미확인)",
  })
  @Column({
    type: "varchar",
    length: 3,
    comment: "카드 종류 (신용, 체크, 기프트, 미확인)",
    nullable: true,
  })
  cardType;

  @ApiProperty({
    type: String,
    required: false,
    default: "매입 상태",
  })
  @Column({
    length: 20,
    type: "varchar",
    comment: "매입 상태",
    nullable: true,
  })
  cardAcquireStatus;
  /**
   * E : Spread Card Object
   */

  @ApiProperty({
    type: String,
    default: "발행된 영수증 정보",
  })
  @Column({
    type: "varchar",
    length: 2000,
    comment: "발행된 영수증 정보",
  })
  receiptUrl: string;

  @ApiProperty({
    type: String,
    default: "결제창 URL",
  })
  @Column({
    type: "varchar",
    length: 2000,
    comment: "결제창 URL",
  })
  checkoutUrl: string;

  /**
   * S : Spread EasyPay Object
   */

  @ApiProperty({
    type: String,
    required: false,
    default: "간편결제 정보",
  })
  @Column({
    type: "varchar",
    length: 20,
    comment: "간편결제 정보",
    nullable: true,
  })
  easyProvider: string;

  @ApiProperty({
    type: Number,
    required: false,
    default: "간편결제 결제금액",
  })
  @Column({
    type: "decimal",
    comment: "간편결제 결제금액",
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  easyAmount: number;

  @ApiProperty({
    type: Number,
    required: false,
    default: "간편결제 할인금액",
  })
  @Column({
    type: "decimal",
    comment: "간편결제 할인금액",
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  easyDiscountAmount: number;
  /**
   * E : Spread EasyPay Object
   */

  @ApiProperty({
    type: String,
    default: "결제국가",
  })
  @Column({
    type: "varchar",
    length: 2,
    comment: "결제국가",
  })
  country: string;

  /**
   * S : Spread Failure Object
   */
  @ApiProperty({
    type: String,
    default: "오류 타입",
  })
  @Column({
    type: "varchar",
    length: 100,
    comment: "오류 타입",
    nullable: true,
  })
  failureCode: string;

  @ApiProperty({
    type: String,
    default: "오류 타입",
  })
  @Column({
    type: "varchar",
    length: 510,
    comment: "에러 메세지",
    nullable: true,
  })
  failureMessage: string;
  /**
   * E : Spread Failure Object
   */

  @ApiProperty({
    type: String,
    default: "결제 통화",
  })
  @Column({
    type: "varchar",
    length: 3,
    comment: "결제 통화",
  })
  currency: string;

  @ApiProperty({
    type: Number,
    default: "총 금액",
  })
  @Column({
    type: "decimal",
    comment: "총 금액",
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @ApiProperty({
    type: Number,
    default: "잔액",
  })
  @Column({
    type: "decimal",
    comment: "잔액",
    transformer: new ColumnNumericTransformer(),
  })
  balanceAmount: number;

  @ApiProperty({
    type: Number,
    default: "공급금액",
  })
  @Column({
    type: "decimal",
    comment: "공급금액",
  })
  suppliedAmount: number;

  @ApiProperty({
    type: Number,
    default: "면세금액",
  })
  @Column({
    type: "decimal",
    comment: "면세금액",
  })
  taxFreeAmount: number;

  @ApiProperty({
    type: Number,
    default: "할인금액",
  })
  @Column({
    type: "decimal",
    comment: "할인금액",
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  discountAmount: number;

  @ApiProperty({
    type: Number,
    default: "부가세",
  })
  @Column({
    type: "decimal",
    comment: "부가세",
  })
  vat: number;

  @ApiProperty({
    type: String,
    default: "버전",
  })
  @Column({
    type: "varchar",
    length: 10,
    comment: "버전",
  })
  version: string;

  @ApiProperty({
    type: String,
    default: "부분취소여부",
  })
  @Column({
    type: "varchar",
    length: 1,
    comment: "부분취소여부",
    default: "N",
  })
  partialCancelableYn: string;

  @ApiProperty({
    type: String,
    default: "취소일시",
  })
  @Column({
    type: "timestamp",
    comment: "취소일시",
    nullable: true,
  })
  cancelledAt: string;

  @ApiProperty({
    type: Number,
    default: "취소금액",
  })
  @Column({
    type: "decimal",
    comment: "취소금액",
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  cancelAmount: number;

  @OneToOne(() => OrdEntity, (ord) => ord.ordPayment)
  @JoinColumn({ name: "order_id" })
  ord: OrdEntity;
}
