import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from 'src/email/email.service';
import { NotificationProcessor } from './notification.processor';
import { EmailModule } from 'src/email/email.module';
@Module({
   imports: [
  BullModule.forRoot({
      connection:{
        host:'localhost',
        port:6379
      }
    }),
    BullModule.registerQueue({
        name:'email-queue'
    }),
EmailModule
  ],
  providers: [QueueService,NotificationProcessor],
   exports: [QueueService]
})
export class QueueModule {}
