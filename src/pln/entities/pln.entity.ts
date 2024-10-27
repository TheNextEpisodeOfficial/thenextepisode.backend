import { ApiProperty } from "@nestjs/swagger";
import { AdncOptEntity } from "@src/adncOpt/entities/adncOpt.entity";
import { BttlOptEntity } from "@src/bttl/entities/bttlOpt.entity";
import { FileEntity } from "@src/s3file/entities/file.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";
import { BttlTeamEntity } from "@src/bttlTeam/entities/bttlTeam.entity";
import { AdncEntity } from "@src/adnc/entities/adnc.entity";
import { FavEntity } from "@src/fav/entities/fav.entity";
@Entity("pln")
@Unique(["fileGrpId"])
export class PlnEntity extends CommonEntity {
  @ApiProperty({ type: String, required: true, default: "플랜명" })
  @Column({ type: "varchar", length: 100, comment: "플랜명" })
  plnNm;

  @ApiProperty({ type: String, required: true, default: "BTTL" })
  @Column({ type: "varchar", length: 10, comment: "플랜타입" })
  plnTypeCd;

  @ApiProperty({
    type: String,
    format: "date",
    required: true,
    default: "2024-01-01",
  })
  @Column({ type: "date", comment: "플랜시작일시" })
  plnDt;

  @ApiProperty({ type: String, required: true, default: "00:00" })
  @Column({ type: "time", comment: "플랜시작시간" })
  plnStTm;

  @ApiProperty({ type: String, required: true, default: "23:59" })
  @Column({ type: "time", comment: "플랜종료시간" })
  plnEndTm;

  @ApiProperty({ type: String, required: true, default: "도로명 주소" })
  @Column({ type: "varchar", length: 100, comment: "도로명 주소" })
  plnRoadAddr;

  @ApiProperty({ type: String, required: true, default: "상세 주소" })
  @Column({ type: "varchar", length: 1000, comment: "상세 주소" })
  plnAddrDtl;

  @ApiProperty({ type: String, required: true, default: "플랜소개" })
  @Column({
    type: "varchar",
    length: 5000,
    comment: "플랜소개",
  })
  plnDsc;

  @ApiProperty({ type: Number, required: true, default: 0 })
  @Column({ type: "int", comment: "총 상금" })
  plnRwrd;

  @ApiProperty({ type: String, required: true, default: "KRW" })
  @Column({ type: "varchar", length: 3, comment: "결제 화폐" })
  crncyCd;

  @ApiProperty({ type: String, required: true, default: "N" })
  @Column({
    type: "varchar",
    length: 1,
    comment: "청소년 관람 및 참가 불가 여부",
  })
  rRatedYn;

  @ApiProperty({ type: String, required: true, default: "N" })
  @Column({
    type: "varchar",
    length: 1,
    comment: "플랜상세에서의 참가자현황 공개 여부",
  })
  showBttlrYn;

  @ApiProperty({ type: String, required: true, default: "N" })
  @Column({
    type: "varchar",
    length: 1,
    comment: "오픈 신청 여부",
    default: "N",
  })
  opnYn;

  @ApiProperty({ type: String, required: true, default: "오픈 승인 일시" })
  @Column({
    type: "timestamptz",
    comment: "오픈 승인 일시",
    nullable: true,
  })
  opnAt;

  @ApiProperty({ type: String, required: true, default: "오픈 승인 여부" })
  @Column({
    type: "varchar",
    length: 1,
    comment: "오픈 승인 여부",
    default: "N",
  })
  opnAprvYn;

  @ApiProperty({ type: String, required: true, default: "오픈 승인 일시" })
  @Column({
    type: "timestamptz",
    comment: "오픈 승인 일시",
    nullable: true,
  })
  opnAprvAt;

  @ApiProperty({ type: String, required: true, default: "유튜브 채널 url" })
  @Column({
    type: "varchar",
    length: 100,
    comment: "유튜브 채널 url",
    nullable: true,
  })
  ytbUrl;

  @ApiProperty({ type: String, required: true, default: "파일그룹 아이디" })
  @Column({
    type: "varchar",
    comment: "파일그룹 아이디",
  })
  fileGrpId: string;

  @OneToMany(() => FileEntity, (file) => file.pln)
  file: FileEntity[];

  @ApiProperty({ type: [BttlOptEntity], required: false })
  @OneToMany(() => BttlOptEntity, (bttlOpt) => bttlOpt.pln)
  bttlOpt: BttlOptEntity[];

  @ApiProperty({ type: [AdncOptEntity], required: false })
  adncOpt: AdncOptEntity[];

  @ApiProperty({ type: [FileEntity], required: false })
  plnImgs: FileEntity[];

  @OneToMany(() => FavEntity, (fav) => fav.pln)
  fav: FavEntity;

  thumb: string;

  mbrId?: string;

  bttlTeamList?: BttlTeamEntity[]; // 기획한 플랜 상세에서 배틀 팀 리스트 조회

  adncList?: AdncEntity[]; // 기획한 플랜 상세에서 관객 리스트 조회

  isFav?: boolean; // 찜 여부
}
