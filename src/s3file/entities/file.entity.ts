import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { PlnEntity } from "@src/pln/entities/pln.entity";

@Entity("s3_file")
export class FileEntity extends CommonEntity {
  @Column({ type: "varchar", length: 1000, comment: "파일명.확장자" })
  fileNm;

  @Column({
    type: "varchar",
    comment: "파일그룹아이디",
  })
  fileGrpId: string;

  @Column({ type: "varchar", length: 8, comment: "파일 종류 코드" })
  fileTypeCd;

  @ManyToOne(() => PlnEntity, (pln) => pln.file)
  @JoinColumn({ name: "file_grp_id", referencedColumnName: "fileGrpId" })
  pln: PlnEntity;
}
