import { ApiProperty } from "@nestjs/swagger";
import { UpsertCommonDto } from "@src/config/dtos/common.dto";
import { Column } from "typeorm";

export class UpsertMbrDto extends UpsertCommonDto {
  @ApiProperty({ type: String, required: true, default: "회원 아이디" })
  @Column({ type: "varchar", length: 100, comment: "회원 아이디" })
  chnlMbrId;

  @ApiProperty({ type: String, required: true, default: "회원명" })
  @Column({ type: "varchar", length: 100, comment: "회원명" })
  mbrNm;

  @ApiProperty({ type: String, required: true, default: "회원 이메일" })
  @Column({ type: "varchar", length: 100, comment: "회원 이메일" })
  email;

  @ApiProperty({ type: String, required: true, default: "M" })
  @Column({ type: "varchar", length: 1, comment: "성별" })
  gender;

  @ApiProperty({ type: String, required: true, default: "010-1234-5678" })
  @Column({ type: "varchar", length: 100, comment: "연락처" })
  mbrPhn;

  @ApiProperty({ type: String, required: true, default: "1990-01-01" })
  @Column({ type: "varchar", length: 8, comment: "생년월일" })
  birth;

  @ApiProperty({ type: String, required: true, default: "" })
  @Column({ type: "varchar", length: 4, comment: "회원 유형 코드" })
  mbrTypeCd;

  @ApiProperty({ type: String, required: true, default: "KAKAO" })
  @Column({ type: "varchar", length: 10, comment: "가입 플랫폼" })
  acntPltfrm;

  @ApiProperty({ type: String, required: true, default: "" })
  @Column({ type: "timestamp", comment: "최근 접속일시" })
  lstLgnTm;

  @ApiProperty({ type: Number, required: true, default: 0 })
  @Column({ type: "int", comment: "회원 상태 코드" })
  mbrSttCd;
}
