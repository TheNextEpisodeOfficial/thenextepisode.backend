import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export class CommonEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { comment: "id" })
  id: string;

  @Column({ type: "int", comment: "정렬", nullable: true })
  sort;

  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: "N" })
  delYn;

  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createStmp;

  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디" })
  createMbrId;

  @UpdateDateColumn({ type: "timestamp", comment: "데이터 수정 일시" })
  updateStmp;

  @Column({ type: "varchar", length: 100, comment: "데이터 수정자 아이디", nullable: true })
  updateMbrId;
}
