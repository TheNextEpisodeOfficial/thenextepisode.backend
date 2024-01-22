import { Controller, Get, Param } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { FileService } from "@src/s3file/file.service";

@Controller("/file")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get("/getFileListByGrpId")
  @ApiOperation({
    summary: "파일그룹 아이디로 파일 리스트 검색",
    description: "파일그룹 아이디로 파일 리스트를 검색한다.",
  })
  @ApiCreatedResponse({
    description: "파일그룹 아이디로 파일 리스트를 검색한다.",
    type: FileEntity,
  })
  getFileByGrpId(@Param("fileGrpId") fileGrpId: string) {
    return this.fileService.getFileListByGrpId(fileGrpId);
  }
}
