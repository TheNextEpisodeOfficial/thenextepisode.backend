import { ApiProperty } from "@nestjs/swagger";
import { SrchCommonDto, UpsertCommonDto } from "@src/config/dtos/common.dto";
import { CommonEntity } from "@src/config/entities/common.entity";
import { Column } from "typeorm";

export class UpsertMbrDto extends UpsertCommonDto {
  @ApiProperty({ type: String, required: true, default: '회원명' })
  @Column({ type: "varchar", length: 100, comment: "회원명" })
  mbrNm;

  @ApiProperty({ type: String, required: true, default: '회원 이메일' })
  @Column({ type: "varchar", length: 100, comment: "회원 이메일" })
  email;
}
