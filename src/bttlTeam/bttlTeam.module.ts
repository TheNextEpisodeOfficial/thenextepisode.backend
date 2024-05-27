import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BttlTeamEntity } from "./entities/bttlTeam.entity";
import { BttlTeamController } from "./bttlTeam.controller";
import { BttlTeamService } from "./bttlTeam.service";

@Module({
  imports: [TypeOrmModule.forFeature([BttlTeamEntity])],
  controllers: [BttlTeamController],
  providers: [BttlTeamService],
})
export class BttlTeamModule {}
