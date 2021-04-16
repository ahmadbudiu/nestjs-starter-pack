import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { BcryptHelper } from '../shared/helpers';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      return undefined;
    }
    if (await BcryptHelper.compare(loginDto.password, user.password)) {
      return user;
    }
    return undefined;
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.validateUser(loginDto);
    if (user) {
      const payload = { username: user.name, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    return null;
  }
}
