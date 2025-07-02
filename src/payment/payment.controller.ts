import { Controller, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/paycallback') 
  async handlePaymentCallback(
    @Query('Authority') authority: string,
    @Query('Status') status: string,
  ) {
    return this.paymentService.verifyPayment(authority, status);
  }
}
