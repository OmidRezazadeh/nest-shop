 import { OnWorkerEvent, Processor, WorkerHost  } from "@nestjs/bullmq";
 import { Job } from 'bullmq';
import { MailService } from '../email/email.service';
@Processor('email-queue')

export class NotificationProcessor extends WorkerHost{

    constructor(private readonly mailService:MailService){
        super();
    }
    async process(job: Job<{ email: string ,price:number}>): Promise<any> {
         const { email,price } = job.data;

         
               await this.mailService.sendOrderCreatedEmail(email,price)
    }
    
    @OnWorkerEvent('completed')
    onCompleted(job: Job){
        console.log(`Job ${job.id} completed! email-queue `);
    }
    @OnWorkerEvent('failed')
    OnFailed(job:Job, error:Error){
       console.error(`❌ Job ${job.id} failed with error:`, error.message);
    }
}