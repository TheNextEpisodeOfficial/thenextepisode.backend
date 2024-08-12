import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("mbr_agree")
export class MbrAgreeEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "회원 아이디" })
  mbrId: string;

  @Column({
    type: "varchar",
    length: 1,
    comment: "이용약관동의여부",
    default: "N",
  })
  termsAcceptYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "개인정보처리동의여부",
    default: "N",
  })
  privacyAcceptYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "개인정보수집동의여부",
    default: "N",
  })
  advertisementYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "광고성정보수신여부",
    default: "N",
  })
  marketingYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "sms여부",
    default: "N",
  })
  smsYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "이메일여부",
    default: "N",
  })
  emailYn;

  @Column({
    type: "varchar",
    length: 1,
    comment: "카카오알림톡여부",
    default: "N",
  })
  kakaoYn;
}
