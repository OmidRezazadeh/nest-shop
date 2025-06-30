import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/user/entities/user.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
imports:[TypeOrmModule.forFeature([Wallet,User])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService,TypeOrmModule],
})
export class WalletModule {}
