import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { PaymentService } from '../payment/payment.service';
import { ChargeWalletDto } from 'src/wallet/dto/charge-wallet.dto';
import { ChargeWalletResponseDto } from 'src/wallet/dto/charge-wallet-response.dto';
import { WalletBalanceResponseDto } from 'src/wallet/dto/wallet-balance-response.dto';


@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentService: PaymentService,
  ) {}
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard)
  @Post('/charge')
  @ApiOperation({ summary: 'Create a payment and get redirect url to charge wallet' })
  @ApiBody({ type: ChargeWalletDto })
  @ApiOkResponse({ type: ChargeWalletResponseDto })
  async charge(
    @Body() body: ChargeWalletDto,
    @Request() request,
  ): Promise<ChargeWalletResponseDto> {
    const userId = request.user.id;
    const paymentUrl = await this.paymentService.charge(body.amount, userId);
    return { url: paymentUrl };
  }
  
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard)
  @Get('balance')
  @ApiOperation({ summary: 'Get authenticated user total wallet balance' })
  @ApiOkResponse({ type: WalletBalanceResponseDto })
  async checkWalletBalance(
    @Request() request,
  ): Promise<WalletBalanceResponseDto> {
    const userId = request.user.id;
    const totalBalance = await this.walletService.getWalletBalance(userId);
    return { total_balance: totalBalance };
  }
  

}
