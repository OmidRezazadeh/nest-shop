import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/wallet/entities/wallet.entity';

import { PaymentService } from './payment.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { PaymentController } from './payment.controller';
import { TransactionService } from 'src/transaction/transaction.service';
import { WalletService } from 'src/wallet/wallet.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { OrderService } from 'src/order/order.service';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet]),
    TransactionModule,
    WalletModule, 
    forwardRef(() => OrderModule),
 
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService], 
})
export class PaymentModule {}
