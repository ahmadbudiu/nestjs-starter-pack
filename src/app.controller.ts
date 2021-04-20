import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './shared/services';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-email')
  testEmail(): string {
    this.emailService
      .to('boedixyz@gmail.com')
      .subject('Test 123')
      .view('mail/welcome')
      .send();
    return 'asdasd';
  }
}
