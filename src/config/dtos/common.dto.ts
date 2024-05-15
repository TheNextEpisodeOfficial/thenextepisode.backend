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
  id;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: "N" })
  delYn;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "검색시작일" })
  srchStDt;

  @ApiProperty({ type: String, format: "date", required: false })
  @Column({ type: "date", comment: "검색종료일" })
  srchEndDt;

  @ApiProperty({ type: String, required: false, format: "date" })
  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createdAt;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디" })
  createdBy;

  @ApiProperty({ type: String, required: false })
  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updatedAt;

  @ApiProperty({ type: String, required: false })
  @Column({ type: "varchar", length: 100, comment: "데이터 수정자 아이디" })
  updateMbrId;

  @ApiProperty({ type: String, required: false })
  route;

  @ApiProperty({ type: Number, required: true })
  page;

  @ApiProperty({ type: Number, required: true })
  limit;

  @ApiProperty({ type: String, required: false })
  orderBy;
}

export class UpsertCommonDto {
  @PrimaryGeneratedColumn("uuid", { comment: "id" })
  @Column({ type: "varchar", length: 36, comment: "아이디", default: "" })
  id?;

  @ApiProperty({ type: String, required: false, default: "N" })
  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: "N" })
  delYn?;

  @ApiProperty({ type: String, required: false, default: "2024-01-01" })
  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createdAt?;

  @ApiProperty({ type: String, required: false, default: "userid" })
  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디" })
  createdBy?;

  @ApiProperty({ type: String, required: false, default: "2024-01-01" })
  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updatedAt?;

  @ApiProperty({ type: String, required: false, default: "userid" })
  @Column({ type: "varchar", length: 100, comment: "데이터 수정자 아이디" })
  updatedBy?;
}
