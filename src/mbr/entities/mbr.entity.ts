import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("mbr")
export class MbrEntity extends CommonEntity {
  @Column({ type: "varchar", length: 100, comment: "유저아이디" })
  mbrId;

  @Column({ type: "varchar", length: 100, comment: "연락처" })
  mbrPhn;

  @Column({ type: "varchar", length: 100, comment: "회원명" })
  mbrNm;

  @Column({ type: "varchar", length: 100, comment: "회원 이메일" })
  email;

  @Column({ type: "varchar", length: 8, comment: "생년월일" })
  birth;

  @Column({ type: "varchar", length: 1, comment: "성별" })
  gender;

  @Column({ type: "varchar", length: 4, comment: "회원 유형 코드" })
  mbrTypeCd;

  @Column({
    type: "varchar",
    length: 100,
    comment: "프로필사진 이미지 파일 아이디",
  })
  mbrImgId;

  @Column({ type: "varchar", length: 1, comment: "댄서여부" })
  dncrYn;

  @Column({ type: "varchar", length: 10, comment: "닉네임" })
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

  @Column({ type: "datetime", comment: "최근 접속일시" })
  lstLgnTm;

  @Column({ type: "varchar", length: 4, comment: "회원 상태 코드" })
  mbrSttCd;
}
