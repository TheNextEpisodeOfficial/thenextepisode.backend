import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";
import { MbrEntity } from "./entities/mbr.entity";

@Injectable()
export class MbrService {
  constructor(
    @InjectRepository(MbrEntity)
    private readonly mbrRepository: Repository<MbrEntity>
  ) {}
}
