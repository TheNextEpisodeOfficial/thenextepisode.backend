import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./util/swagger";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { join } from "path";
declare const module: any;

async function bootstrap() {
  console.log(
    `
    
                              ╔@⌐                         _
    ,╓         Φ╬▒╖_          ╙╬▒  ,,                    ╣╬▒
  ╔Æ╬╬╬▒▒@#φ╗╓,'╙╣╬╬╬φ╓_       ╙╬Hj╬╬╬▒φ╓_               ╢╬╬_    ,__     __ _,,,
  ╙╝╟╬╬╩╙╙╙╙╢╬╬─ [╬╬╬╙╝╬▒╦_ ,,,_╠▒__"╙╝╬╬╬╣▒╗╓_        ,╗╠╬╬╬   [╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬⌐
     ╟╬╣_,╔║╬╬"  '╬╬▒   '╠╬╬╬╬╬╬╬╬╬╬╬╬ ╙╬╬╬╙╜╝╬╬▒φ╓_ ,║╬╬╙╙"'   _)╬╬▒    _²_,╓╖╖╗╦
    _#╬╬╬╬╬╬╬▒@φφ╗╬╬╬  ,╗╬╬"   j╬╬      ╢╬╣     '"╙╟╣╬╬▒  _╓╔φΦ╣╬╬╬╬╬╬╬╬╬╬╬╬╝╜╙"''
    '╙╙╬╬"''   ,╠╬╬╬╬╬╬╬▒,_    !╬╬      ╙╬╬²       ╓║╬╬▒╚╙╙"''   ╠╬╨╠╬Ö''  ,╓φφ
       ╚╬▒ ,╓φ╬╣╝╙ ╠╬▒'"╙╙╙RK╦,[╬Ñ       ╬╬▒  _╓╗@╣╣╨"╬╣╓       _╬D  ╬╬,╓@╬╬╬╙'
     _²╔╣╬╩╙╙"     [╬▒   ╔@@φφ▄╢╬▒__ ,,╓╓╠╬╬R╩╜╙"'     ╙╝╬W╓_  ,╬╩   '╬╬╬╝╙
     '╙' ╝K         ╙^   '╙╙╙╙╙╜╜╜╜╜╙╙^'  ╙╜              '"╙╙╜╙"     ╙╙'


                  The World's First Platform Manages Dancers Plans


     `
  );

  const app = await NestFactory.create(AppModule);
  app.use(cors());
  app.use(cookieParser());
  app.use("/public", express.static(join(process.cwd(), "src", "public")));

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  setupSwagger(app);
  await app.listen(9090);
  console.log(
    `
╭―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――╮
│                                                                 │
│                                                                 │
│                                                                 │
│           Server is running on \u001b[36mhttp://localhost:9090\u001b[0m            │
│           Swagger on \u001b[35mhttp://localhost:9090/api-docs\u001b[0m             │
│                                                                 │
│                                                                 │
│                                                                 │
╰―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――╯
    `
  )
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
