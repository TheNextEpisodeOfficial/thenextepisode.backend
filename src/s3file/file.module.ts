import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MODULE_CONFIG } from "@src/config/constants/constants";
import { FileEntity } from "./entities/file.entity";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import AWS from "aws-sdk";

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: "AWS_S3", // Provide token for dependency injection
      useFactory: () => {
        return new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION,
        });
      },
    },
  ],
})
export class FileModule {}
