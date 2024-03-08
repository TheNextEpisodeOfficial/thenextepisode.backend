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
    ▄▄▄▄    ██▀███   ██▓▓█████▄   ▄████ ▓█████ 
    ▓█████▄ ▓██ ▒ ██▒▓██▒▒██▀ ██▌ ██▒ ▀█▒▓█   ▀ 
    ▒██▒ ▄██▓██ ░▄█ ▒▒██▒░██   █▌▒██░▄▄▄░▒███   
    ▒██░█▀  ▒██▀▀█▄  ░██░░▓█▄   ▌░▓█  ██▓▒▓█  ▄ 
    ░▓█  ▀█▓░██▓ ▒██▒░██░░▒████▓ ░▒▓███▀▒░▒████▒
    ░▒▓███▀▒░ ▒▓ ░▒▓░░▓   ▒▒▓  ▒  ░▒   ▒ ░░ ▒░ ░
    ▒░▒   ░   ░▒ ░ ▒░ ▒ ░ ░ ▒  ▒   ░   ░  ░ ░  ░
     ░    ░   ░░   ░  ▒ ░ ░ ░  ░ ░ ░   ░    ░   
     ░         ░      ░     ░          ░    ░  ░
          ░               ░                     
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
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
