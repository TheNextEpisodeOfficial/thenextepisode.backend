import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SysDictEntity } from "@src/sys/entities/sysDict.entity";

import { Repository } from "typeorm";
import { SysDictItemEntity } from "./entities/sysDictItem.entity";

@Injectable()
export class SysService {
  constructor(
    @InjectRepository(SysDictEntity)
    private readonly dictRepository: Repository<SysDictEntity>,
    @InjectRepository(SysDictItemEntity)
    private readonly dictItemRepository: Repository<SysDictItemEntity>
  ) {}

  async getDictItemsByDictCd(dictCd: string): Promise<SysDictItemEntity[]> {
    const dict = await this.dictRepository.findOne({
      where: { dictCd: dictCd, delYn: "N" },
    });

    let dictItemList: Promise<SysDictItemEntity[]> | null = null;
    if (dict) {
      dictItemList = this.dictItemRepository.find({
        where: { dictId: dict.id, delYn: "N" },
      });
    }

    return dictItemList;
  }
}
