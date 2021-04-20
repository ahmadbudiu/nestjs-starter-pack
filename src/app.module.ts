import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { LoggerMiddleware } from './shared/middlewares';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './shared/services';
import * as path from 'path';

const ApplicationModule = [UserModule, AuthModule];

const date = new Date();
const month = +date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
const day = +date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
const now = date.getFullYear() + '-' + month + '-' + day;

const VendorModule = [
  TypeOrmModule.forRootAsync({
    useFactory: async () =>
      Object.assign(await getConnectionOptions(), {
        autoLoadEntities: true,
        type: 'mysql',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: ['dist/**/entities/*{.js,.ts}'],
        synchronize: true,
      }),
  }),
  ThrottlerModule.forRoot({
    ttl: 60,
    limit: 10,
  }),
  ConfigModule.forRoot({
    envFilePath: '.env',
  }),
  WinstonModule.forRootAsync({
    useFactory: async () => {
      return {
        transports: [
          new winston.transports.File({
            level: 'error',
            filename: path.join(__dirname, 'logs', now + '-error.log'),
            format: winston.format.combine(
              winston.format.label({ label: 'flower' }),
              winston.format.timestamp(),
              winston.format.printf(({ level, message, label, timestamp }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
              }),
            ),
          }),
          new winston.transports.File({
            filename: path.join(__dirname, 'logs', now + '-access.log'),
            format: winston.format.combine(
              winston.format.label({ label: 'flower' }),
              winston.format.timestamp(),
              winston.format.printf(({ level, message, label, timestamp }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
              }),
            ),
          }),
        ],
      };
    },
  }),
  MailerModule.forRootAsync({
    useFactory: async () => {
      return {
        transport:
          process.env.MAIL_DRIVER +
          '://' +
          process.env.MAIL_USERNAME +
          ':' +
          process.env.MAIL_PASSWORD +
          '@' +
          process.env.MAIL_HOST,
        defaults: {
          from: process.env.MAIL_FROM,
        },
        template: {
          dir: path.join(process.cwd(), 'dist/views/mail'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: path.join(process.cwd(), 'dist/views/mail'),
            options: {
              strict: true,
            },
          },
        },
      };
    },
  }),
];

@Module({
  imports: [...VendorModule, ...ApplicationModule],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
