import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtStrategy } from '../shared/guards/auth/jwt.strategy';
import { LocalStrategy } from '../shared/guards/auth/local.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, LocalStrategy],
  exports: [UserService],
})
export class UserModule {}
