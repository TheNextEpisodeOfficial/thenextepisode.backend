import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PlnEntity } from "@src/pln/entities/pln.entity";

import { Repository } from "typeorm";
import { Pagination, paginate } from "nestjs-typeorm-paginate";
import { BttlOptEntity } from "./entities/bttlOpt.entity";

@Injectable()
export class BttlService {
  constructor(
    @InjectRepository(BttlOptEntity)
    private readonly bttlOptRepository: Repository<BttlOptEntity>
  ) {}
}
