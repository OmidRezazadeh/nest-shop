import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
@Injectable()
export class QueueService {


constructor(@InjectQueue('email-queue') private emailQueue:Queue ){}

async sendNotification(data:any){
  await this.emailQueue.add('email-queue',data)
}

}
