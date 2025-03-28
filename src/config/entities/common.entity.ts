import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
export class CommonEntity extends BaseEntity {
  @Index()
  @PrimaryGeneratedColumn("uuid", { comment: "id" })
  id: string;

  @Column({ type: "int", comment: "정렬", nullable: true })
  sort: number;

  @Column({
    type: "varchar",
    length: 1,
    comment: "삭제여부",
    default: "N",
    select: false,
  })
  delYn: string;

  @CreateDateColumn({
    type: "timestamptz",
    comment: "데이터 생성 일시",
  })
  createdAt: string;

  @Column({
    type: "varchar",
    length: 36,
    comment: "데이터 생성자 아이디",
    precision: 0,
  })
  createdBy: string;

  @UpdateDateColumn({
    type: "timestamptz",
    comment: "데이터 수정 일시",
    nullable: true,
    select: false,
  })
  updatedAt: string;

  @Column({
    type: "varchar",
    length: 36,
    comment: "데이터 수정자 아이디",
    nullable: true,
    precision: 0,
    select: false,
  })
  updatedBy: string;

  @BeforeInsert()
  setCreatedBy() {
    // 세션에서 사용자 ID를 가져오는 방법은 애플리케이션에 따라 다를 수 있습니다.
    this.createdBy = "kany";
  }

  @BeforeUpdate()
  setUpdatedBy() {
    this.updatedBy = "kany";
  }
}
