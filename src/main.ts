import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./util/swagger";
import cors from "cors";
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors());
  setupSwagger(app);
  await app.listen(9090);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
