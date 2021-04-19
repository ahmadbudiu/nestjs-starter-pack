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
  WinstonModule.forRoot({
    transports: [
      new winston.transports.File({
        level: 'error',
        filename: 'logs/' + now + '-error.log',
        format: winston.format.combine(
          winston.format.label({ label: 'flower' }),
          winston.format.timestamp(),
          winston.format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/' + now + '-access.log',
        format: winston.format.combine(
          winston.format.label({ label: 'flower' }),
          winston.format.timestamp(),
          winston.format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
          }),
        ),
      }),
    ],
  }),
];

@Module({
  imports: [...VendorModule, ...ApplicationModule],
  controllers: [AppController],
  providers: [
    AppService,
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
