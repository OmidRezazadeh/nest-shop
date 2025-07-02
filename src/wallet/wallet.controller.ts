import { Body, Controller, Post, UseGuards, Request, Query, Get } from '@nestjs/common';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { PaymentService } from '../payment/payment.service';
import { TransactionService } from '../transaction/transaction.service';
;

import { DataSource } from 'typeorm';
import { BadRequestException } from 'src/common/constants/custom-http.exceptions';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    private readonly dataSource:DataSource
  ) {}
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard) 
  @Post('/charge')
  async charge(@Body() body: { amount: number }, @Request() request) {


  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect(); 
  await queryRunner.startTransaction(); 

    try {
      
    const userId = request.user.id;
    
    const wallet = await this.walletService.create(queryRunner,body.amount, userId);
    
    const result = await this.paymentService.pay(wallet);
  
    const transactionData = {
      user: { id: userId },
      wallet: { id: wallet.id },
      amount: wallet.amount,
      authority: result.authority,
      gateway: 'ZARINPAL'
    };

    await this.transactionService.create(queryRunner,transactionData);
     await queryRunner.commitTransaction();
    return result.url;
    } catch (error) {
      
       await queryRunner.rollbackTransaction();
          console.error(error); 
          throw new BadRequestException(' پرداخت با مشکل مواجه شد'); 
        } finally {
          await queryRunner.release();
        }
    }

  
  }

