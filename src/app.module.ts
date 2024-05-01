import { Module } from "@nestjs/common";
import { PlnModule } from "./pln/pln.module";
import { MbrModule } from "./mbr/mbr.module";
import { FileModule } from "./s3file/file.module";
import { SysModule } from "./sys/sys.module";
import { MODULE_CONFIG } from "./config/constants/constants";
import { AuthModule } from "./auth/auth.module";
import { BttlModule } from "./bttl/bttl.module";
import { CelebModule } from "./celeb/celeb.module";
import { BttlOptRolebModule } from "./bttlOptRole/bttlOptRole.module";

@Module({
  imports: [
    ...MODULE_CONFIG,
    PlnModule,
    BttlModule,
    BttlOptRolebModule,
    AuthModule,
    MbrModule,
    CelebModule,
    FileModule,
    SysModule,
  ],
})
export class AppModule {}
