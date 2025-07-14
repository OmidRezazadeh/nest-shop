import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { PaymentService } from '../payment/payment.service';
import { TransactionService } from '../transaction/transaction.service';
import { DataSource } from 'typeorm';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    private readonly dataSource: DataSource,
  ) {}
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard)
  @Post('/charge')
  async charge(@Body() body: { amount: number }, @Request() request) {
    const userId = request.user.id;
    const paymentUrl = await this.paymentService.charge(body.amount, userId);
    return { url: paymentUrl };
  }
  
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard)
  @Get('balance')
  async checkWalletBalance(@Request() request) {
    const userId = request.user.id;
    const totalBalance = await this.walletService.getWalletBalance(userId);
    return { total_balance: totalBalance };
  }

}
