import { UpsertCommonDto } from "@src/config/dtos/common.dto";
export class UpsertCartDto extends UpsertCommonDto {
  id?: string;
  qty: number;
  bttlOptId?: string;
  adncOptId?: string;
  consciousUpdate?: boolean;
  mbrId?: string;
}

export class UpdateCartCheckedBulkDto {
  ids: Array<string>;
  status: 'Y' | 'N';
}
