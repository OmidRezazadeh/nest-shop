import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST as string,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendOrderCreatedEmail(email:string, totalPrice:number){
    await this.transporter.sendMail({
      from: 'App Shop',
      to: email,
      subject: ' فاکتور ثبت شده',
      text: `  مبلغ فاکتور شما ${totalPrice} `,

    })
  }






  async sendConfirmationEmail(email: string, confirmationCode: number) {
    await this.transporter.sendMail({
      from: 'App Shop',
      to: email,
      subject: 'کد اعتبار سنجی',
      text: `کد اعتبار سنجی شما: ${confirmationCode}`,
    });
  }

  async sendCodeEmail(email: string, confirmationCode: number) {
    await this.transporter.sendMail({
      from: 'App Shop',
      to: email,
      subject: 'تغییر رمز عبور',
      text: `کد تغییر اعتبار سنجی: ${confirmationCode}`,

    });
  }


}
