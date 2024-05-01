import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CelebEntity } from "@src/celeb/entities/celeb.entity";

import { EntityManager, ILike, Repository } from "typeorm";
import { BttlOptRoleEntity } from "./entities/bttlOptRole.entity";

@Injectable()
export class BttlOptRoleService {
  constructor(
    @InjectRepository(BttlOptRoleEntity)
    private readonly bttlOptRoleRepository: Repository<BttlOptRoleEntity>
  ) {}


}
