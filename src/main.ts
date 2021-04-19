import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors();

  app.use(cookieParser(process.env.APP_SECRET));
  app.use(csurf({ cookie: { key: '_csrf', sameSite: true } }));

  await app.listen(process.env.PORT);
}
bootstrap();
