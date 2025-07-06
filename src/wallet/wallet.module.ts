import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/user/entities/user.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { JwtModule } from '@nestjs/jwt';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { PaymentService } from 'src/payment/payment.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
imports:[TypeOrmModule.forFeature([Wallet,User,Transaction]),
JwtModule.registerAsync({
  useFactory:()=>({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
  })
}),
],
  controllers: [WalletController],
  providers: [WalletService,TransactionService,PaymentService],
  exports: [WalletService,TypeOrmModule],
})
export class WalletModule {}
