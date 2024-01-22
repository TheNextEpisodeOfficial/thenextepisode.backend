import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { response } from "src/types/response";
import { Repository } from "typeorm";

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
}
