import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileEntity } from "@src/s3file/entities/file.entity";
import { FileService } from "@src/s3file/file.service";

@Controller("/file")
@ApiTags("File")
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

  /**
   * S : getPresignedUrl
   */
  @Get("/getPresignedUrl")
  @ApiOperation({
    summary: "S3 업로드 URL 생성",
    description: "S3 업로드 URL을 생성한다.",
  })
  @ApiCreatedResponse({
    description: "S3 업로드 URL을 생성한다.",
    type: null,
  })
  async getPresignedUrl(@Query("key") key: string) {
    try {
      return await this.fileService.getPresignedUrl(key);
    } catch (e) {
      console.error(e);
    }
  }
  /**
   * E : getPresignedUrl
   */
}
