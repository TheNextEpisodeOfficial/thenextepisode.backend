import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
export class SrchCommonDto {
  @ApiProperty({ type: String, required: false })
  id?: string;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: "N" })
  delYn?: string;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "검색시작일" })
  srchStDt?: string;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "검색종료일" })
  srchEndDt?: string;

  @ApiProperty({ type: String, required: false, format: "date" })
  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createdAt?: string;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디" })
  createdBy?: string;

  @ApiProperty({ type: String, required: false })
  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updatedAt?: string;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "데이터 수정자 아이디" })
  updateMbrId?: string;

  @ApiProperty({ type: String, required: false })
  route?: string;

  @ApiProperty({ type: Number, required: true })
  page: number;

  @ApiProperty({ type: Number, required: true })
  limit: number;

  @ApiProperty({ type: String, required: false })
  orderBy?: string;
}

export class UpsertCommonDto {
  @PrimaryGeneratedColumn("uuid", { comment: "id" })
  @Column({ type: "varchar", length: 36, comment: "아이디", default: "" })
  id?: string;

  @ApiProperty({ type: String, required: false, default: "N" })
  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: "N" })
  delYn?: string;

  @ApiProperty({ type: String, required: false, default: "2024-01-01" })
  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createdAt?: string;

  @ApiProperty({ type: String, required: false, default: "userid" })
  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디" })
  createdBy?: string;

  @ApiProperty({ type: String, required: false, default: "2024-01-01" })
  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updatedAt?: string;

  @ApiProperty({ type: String, required: false, default: "userid" })
  @Column({ type: "varchar", length: 100, comment: "데이터 수정자 아이디" })
  updatedBy?: string;
}
