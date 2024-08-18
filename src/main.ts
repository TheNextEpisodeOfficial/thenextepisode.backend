import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./util/swagger/index";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { join } from "path";
import session from "express-session";
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use("/public", express.static(join(process.cwd(), "src", "public")));
  app.use(
    session({
      secret: "session",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.enableCors({
    origin: process.env.LOGIN_REDIRECT_URL,
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
  );
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
