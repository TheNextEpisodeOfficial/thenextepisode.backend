import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export class SrchCommonDto extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { comment: "id" })
  @ApiProperty({ type: String, required: false })
  id: string;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: "N" })
  delYn;

  @ApiProperty({ type: String, required: false, format: "date" })
  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createStmp;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디" })
  createMbrId;

  @ApiProperty({ type: String, required: false })
  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updateStmp;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "데이터 수정자 아이디" })
  updateMbrId;
}
