import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

    async sendConfirmationEmail(email:string, confirmationCode:number){
        const transport = nodemailer.createTransport({
          host: process.env.EMAIL_HOST as string,
          port: Number(process.env.EMAIL_PORT), 
          secure: false, 
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      
        await transport.sendMail({
          from:'app shop',
          to: email,
          subject: 'کد اعتبار سنجی',
          text: `کد اغتبار سنجی است : ${confirmationCode}`,
        });
      }

}