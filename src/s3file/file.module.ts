import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MODULE_CONFIG } from "@src/config/constants/constants";
import { FileEntity } from "./entities/file.entity";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
