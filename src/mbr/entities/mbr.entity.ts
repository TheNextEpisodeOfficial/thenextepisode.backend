import { BttlOptRoleEntity } from "@src/bttlOptRole/entities/bttlOptRole.entity";
import { TcktEntity } from "@src/tckt/entities/tckt.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { OrdEntity } from "@src/ord/entities/ord.entity";
import { GNR, PLN_TYPE } from "@src/types/common.type";
import { CartEntity } from "@src/cart/entities/cart.entity";

@Entity("mbr")
export class MbrEntity extends CommonEntity {
  @Column({
    type: "varchar",
    length: 36,
    comment: "셀럽아이디",
    nullable: true,
  })
  celebId;

  @Column({ type: "varchar", length: 100, comment: "유저아이디" })
  chnlMbrId;

  @Column({ type: "varchar", length: 100, comment: "연락처" })
  mbrPhn;

  @Column({ type: "varchar", length: 100, comment: "회원명" })
  mbrNm;

  @Column({ type: "varchar", length: 100, comment: "회원 이메일" })
  email;

  @Column({ type: "varchar", length: 8, comment: "생년월일" })
  birth;

  @Column({ type: "varchar", length: 6, comment: "성별", nullable: true })
  gender;

  @Column({ type: "varchar", length: 4, comment: "회원 유형 코드" })
  mbrTypeCd;

  @Column({
    type: "varchar",
    length: 100,
    comment: "프로필사진 이미지 파일 아이디",
    nullable: true,
  })
  mbrImgId;

  @Column({ type: "varchar", length: 1, comment: "댄서여부", nullable: true })
  dncrYn;

  @Column({ type: "varchar", length: 10, comment: "닉네임", nullable: true })
  nickNm;

  @Column({ type: "varchar", length: 10, comment: "가입 플랫폼" })
  acntPltfrm;

  @Column({
    type: "varchar",
    length: 10,
    comment: "다크모드 여부",
    default: "Y",
  })
  drkYn;

  @Column({ type: "timestamp", comment: "최근 접속일시" })
  lstLgnTm;

  // 0: 가입미완료, 1: 가입완료, 2: 정지, 3: 탈퇴
  @Column({ type: "int", comment: "회원 상태 코드" })
  mbrSttCd: number;

  // S: 약관
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
  // E : 약관

  @Column({
    type: "varchar",
    length: 4,
    comment: "관심장르",
    default: "{}",
    array: true,
  })
  favGnr: Array<GNR>;

  @Column({
    type: "varchar",
    length: 4,
    comment: "관심행사타입",
    default: "{}",
    array: true,
  })
  favPlnType: Array<PLN_TYPE>;

  // Join With BttlOptRoleEntity
  @OneToMany(() => BttlOptRoleEntity, (bttlOptRole) => bttlOptRole.mbr)
  bttlOptRole: BttlOptRoleEntity;

  // Join With TcktEntity
  @OneToMany(() => TcktEntity, (tckt) => tckt.mbr)
  tckt: TcktEntity[];

  // Join With OrdEntity
  @OneToMany(() => OrdEntity, (ord) => ord.mbr)
  ord: OrdEntity[];

  // Join With CartEntity
  @OneToMany(() => CartEntity, (cart) => cart.mbr)
  cart: CartEntity[];
}
