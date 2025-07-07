import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports:[TypeOrmModule.forFeature([Transaction])


],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService], 

})
export class TransactionModule {}
