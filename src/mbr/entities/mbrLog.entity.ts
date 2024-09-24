import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("mbr_log")
export class MbrLogEntity extends CommonEntity {
  @Column({ type: "uuid", comment: "회원 아이디" })
  mbrId: string;

  @Column({
    type: "varchar",
    length: 1,
    comment: "로그타입(J: 가입, Q: 탈퇴, B:정지, R:복구)",
  })
  logType: string;
}
