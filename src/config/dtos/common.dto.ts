import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export class SrchCommonDto {
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

  @ApiProperty({ type: String, required: false })
  route;

  @ApiProperty({ type: Number, required: true })
  page;

  @ApiProperty({ type: Number, required: true })
  limit;

  @ApiProperty({ type: String, required: false })
  order;
}

export class UpsertCommonDto {
  @PrimaryGeneratedColumn("uuid", { comment: "id" })
  @ApiProperty({ type: String, required: false, default: 'generated-uuid-here' })
  id: string;

  @ApiProperty({ type: String, required: false, default: 'N' })
  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: 'N' })
  delYn;

  @ApiProperty({ type: String, required: false, format: "date" })
  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createStmp;

  @ApiProperty({ type: String, required: false, default: 'userid' })
  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디" })
  createMbrId;

  @ApiProperty({ type: String, required: false, default: 'auto-update' })
  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updateStmp;

  @ApiProperty({ type: String, required: false, default: null })
  @Column({ type: "varchar", length: 100, comment: "데이터 수정자 아이디" })
  updateMbrId;
}