import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser('asdasd'));
  app.use(csurf({ cookie: { key: '_csrf', sameSite: true } }));
  await app.listen(process.env.PORT);
}
bootstrap();
