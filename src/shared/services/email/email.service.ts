import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  protected emailTo: string;
  protected subjectString: string;
  protected viewFile: string;

  to(email: string): this {
    this.emailTo = email;
    return this;
  }

  subject(subject: string): this {
    this.subjectString = subject;
    return this;
  }

  view(view: string): this {
    this.viewFile = view;
    return this;
  }

  create(emailParam: EmailParam): this {
    this.to(emailParam.to).subject(emailParam.subject).view(emailParam.view);
    return this;
  }

  send(view?): void {
    if (view) {
      this.view(view);
    }
    const viewDir = path.join(process.cwd(), 'dist/views');
    this.mailerService
      .sendMail({
        to: this.emailTo,
        subject: this.subjectString,
        template: path.join(viewDir, this.viewFile),
      })
      .then(() => {
        console.log('email sent');
      })
      .catch((e) => {
        console.log(e);
      });
  }
}

export interface EmailParam {
  to: string;
  subject: string;
  view: string;
}
