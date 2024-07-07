import { ApiProperty } from "@nestjs/swagger";
import { SrchCommonDto } from "@src/config/dtos/common.dto";
import { Column } from "typeorm";

export class SrchOrdListDto extends SrchCommonDto {
  mbrId: string;
}
