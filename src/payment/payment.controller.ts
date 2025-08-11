import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/paycallback') 
  @ApiOperation({ summary: 'Payment gateway callback (Zarinpal)' })
  @ApiQuery({ name: 'Authority', type: String, required: true })
  @ApiQuery({ name: 'Status', type: String, required: true })
  async handlePaymentCallback(
    @Query('Authority') authority: string,
    @Query('Status') status: string,

  ) {
   
    return this.paymentService.verifyPayment(authority, status);
  }
}
