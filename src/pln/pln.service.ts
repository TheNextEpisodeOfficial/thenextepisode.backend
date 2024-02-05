import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";

import { Repository } from "typeorm";
import { SrchPlnDto } from "./dtos/pln.dto";

@Injectable()
export class PlnService {
  constructor(
    @InjectRepository(PlnEntity)
    private readonly plnRepository: Repository<PlnEntity>
  ) {}

  getAllPln(): Promise<PlnEntity[]> {
    return this.plnRepository.find({
      where: {
        delYn: "N",
      },
    });
  }

  getPlnById(plnId: string): Promise<PlnEntity> {
    return this.plnRepository.findOne({
      where: {
        id: plnId,
        delYn: "N",
      },
    });
  }

  getPlndPln(mbrId: string): Promise<PlnEntity[]> {
    return this.plnRepository.find({
      where: {
        createMbrId: mbrId,
        delYn: "N",
      },
      order: { createStmp: "DESC" },
    });
  }

  upsrtPln(pln: PlnEntity): void {
    this.plnRepository.upsert(pln, ["id"]);
  }

  srchPln(pln: SrchPlnDto): Promise<PlnEntity[]> {
    return this.plnRepository.find({
      where: {
        id: pln.id,
        plnNm: pln.plnNm,
        plnTypeCd: pln.plnTypeCd,
        delYn: pln.delYn || "N",
      },
    });
  }
}
