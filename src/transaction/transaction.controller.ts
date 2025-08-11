import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { transactionResponseDto } from './dto/transaction-response-dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {

    constructor(
        private readonly transactionService:TransactionService
    ){}
    @UseGuards(JwtAuthGuard,CheckVerifiedGuard)
    @Get('wallet-history')
    @ApiOperation({ summary: 'Get authenticated user wallet transaction history' })
    @ApiOkResponse({ type: [transactionResponseDto] })
   async getUserWalletHistory(@Request() request){
        const userId= request.user.id;
       return await this.transactionService.getUserWalletHistory(userId)
    }
    
}
