import { Controller, Get, UseGuards,Request } from '@nestjs/common';

import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {

    constructor(
        private readonly transactionService:TransactionService
    ){}
    @UseGuards(JwtAuthGuard,CheckVerifiedGuard)
    @Get('wallet-history')
   async getUserWalletHistory(@Request() request){
        const userId= request.user.id;
       return await this.transactionService.getUserWalletHistory(userId)
    }
    
}
