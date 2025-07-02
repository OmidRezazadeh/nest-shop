import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/wallet/entities/wallet.entity';

import { PaymentService } from './payment.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { PaymentController } from './payment.controller';

@Module({
      imports:[TypeOrmModule.forFeature([Transaction,Wallet])],
        providers: [PaymentService],
        controllers: [PaymentController],

})
export class PaymentModule {}
