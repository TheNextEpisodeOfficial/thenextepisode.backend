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
import { OrdPaymentModule } from "./ordPayment/ordPayment.module";
import { OrdItemModule } from "./ordItem/ordItem.module";
import { BttlTeamModule } from "./bttlTeam/bttlTeam.module";
import { BttlrModule } from "./bttlr/bttlr.module";
import { AdncModule } from "./adnc/adnc.module";
import { OrdModule } from "./ord/ord.module";
import { TcktModule } from "./tckt/tckt.module";
import { CartModule } from "@src/cart/cart.module";
import { FavModule } from "@src/fav/fav.module";

@Module({
  imports: [
    ...MODULE_CONFIG,
    AuthModule,
    PlnModule,
    BttlModule,
    BttlOptRolebModule,
    CartModule,
    FavModule,
    MbrModule,
    CelebModule,
    AdncModule,
    BttlTeamModule,
    BttlrModule,
    OrdModule,
    OrdItemModule,
    OrdPaymentModule,
    TcktModule,
    FileModule,
    SysModule,
    AuthModule,
  ],
})
export class AppModule {}
