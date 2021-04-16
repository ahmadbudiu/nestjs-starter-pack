import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ResponseHelper } from '../shared/helpers';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('get-csrf')
  getCsrf(@Request() request: any) {
    return ResponseHelper.create({ data: request.csrfToken() });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const isLoginSuccess = await this.authService.login(loginDto);
    return ResponseHelper.create({ data: isLoginSuccess });
  }
}
