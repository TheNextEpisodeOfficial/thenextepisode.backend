import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("s3_file")
export class FileEntity extends CommonEntity {
  @Column({ type: "varchar", length: 1000, comment: "url" })
  url;

  @Column({
    type: "varchar",
    length: 100,
    comment: "파일그룹아이디",
    nullable: true,
  })
  fileGrpId;

  @Column({ type: "varchar", length: 100, comment: "파일 종류 코드" })
  fileTypeCd;
}
