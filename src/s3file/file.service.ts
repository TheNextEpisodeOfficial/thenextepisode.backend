import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { response } from "src/types/response";
import { Repository } from "typeorm";
import AWS from "aws-sdk";
@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>
  ) {}

  getFileListByGrpId(fileGripId: string): Promise<FileEntity[]> {
    const fileList = this.fileRepository.find({
      where: { fileGrpId: fileGripId },
    });

    return fileList;
  }

  async getPresignedUrl(key: string) {
    const s3 = new AWS.S3();
    const params = {
      Bucket: "tne.imgs",
      Key: key, // S3 버킷 내에서 객체를 식별하는 키
      Expires: 3600, // Presigned URL의 만료 시간 (초)
    };

    return s3.getSignedUrlPromise("putObject", params);
  }
}
