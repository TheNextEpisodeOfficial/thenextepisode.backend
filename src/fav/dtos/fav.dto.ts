import { UpsertCommonDto } from "@src/config/dtos/common.dto";
export class InsertFavDto extends UpsertCommonDto {
  plnId: string;
  mbrId: string;
}

export class DeleteFavDto extends UpsertCommonDto {
  id: string;
}
