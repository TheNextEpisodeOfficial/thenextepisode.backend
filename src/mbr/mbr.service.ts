import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";
import { MbrEntity } from "./entities/mbr.entity";
import { UpsertMbrDto } from "./dtos/mbr.dto";

@Injectable()
export class MbrService {
  constructor(
    @InjectRepository(MbrEntity)
    private readonly mbrRepository: Repository<MbrEntity>
  ) {}

  findByEmail(email:string): Promise<MbrEntity>{
    return this.mbrRepository.findOne({
      where: {
        email: email,
        delYn: "N",
      },
    });
  }

  createMbr(upsertMbrDto: UpsertMbrDto):Promise<UpsertMbrDto & MbrEntity>{
    return this.mbrRepository.save(upsertMbrDto)
  }
}
