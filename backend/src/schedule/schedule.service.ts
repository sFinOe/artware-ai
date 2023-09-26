import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ScheduleService {
  private totalGenerationPerDay = 0;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    this.totalGenerationPerDay = 0;
  }

  getTotalGenerationPerDay() {
    return this.totalGenerationPerDay;
  }

  async incrementTotalGenerationPerDay() {
    if (
      this.totalGenerationPerDay + 1 ===
      parseInt(process.env.TOTAL_FREE_GENERATIONS_PER_DAY)
    ) {
      const mailOptions = {
        from: process.env.MAIL_DEFAULT_EMAIL,
        to: process.env.NOTIFICATION_EMAIL,
        subject: 'Free Daily Generation Limit Exceeded',
        text: 'Free Daily Generation Limit Exceeded',
      };

      await this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        }
        console.log('Email sent: ' + info.response);
      });
    }

    if (
      this.totalGenerationPerDay >=
      parseInt(process.env.TOTAL_FREE_GENERATIONS_PER_DAY)
    ) {
      return;
    }

    this.totalGenerationPerDay++;
  }
}
