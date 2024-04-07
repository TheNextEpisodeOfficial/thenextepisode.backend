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
  sort: number;

  @Column({ type: "varchar", length: 1, comment: "삭제여부", default: "N" })
  delYn: string;

  @CreateDateColumn({ type: "timestamp", comment: "데이터 생성 일시" })
  createStmp: string;

  @Column({ type: "varchar", length: 100, comment: "데이터 생성자 아이디", default: 'memberid' })
  createMbrId: string;

  @UpdateDateColumn({
    type: "timestamp",
    comment: "데이터 수정 일시",
    nullable: true,
  })
  updateStmp: string;

  @Column({
    type: "varchar",
    length: 100,
    comment: "데이터 수정자 아이디",
    nullable: true,
  })
  updateMbrId: string;
}
