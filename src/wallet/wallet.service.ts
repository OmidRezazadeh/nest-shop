import { Injectable, NotFoundException } from '@nestjs/common';
import { Wallet, WalletStatus, WalletType } from './entities/wallet.entity';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWalletDto } from './dto/create-wallet-dto';
@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createWithDraw(
    userId: number,
    totalPrice: number,
    queryRunner: QueryRunner,
  ) {
    const wallet = queryRunner.manager.create(Wallet, {
      user: { id: userId },
      amount: totalPrice,
      type: WalletType.WITHDRAW,
      status: WalletStatus.SUCCESS,
    });
    return await queryRunner.manager.save(Wallet, wallet);
  }
  async create(queryRunner: QueryRunner,walletData:CreateWalletDto) {
    const wallet = queryRunner.manager.create(Wallet, {
      amount: walletData.amount,
      user: { id: walletData.userId },
      status: walletData.status,
      type: walletData.type,
    });
    return await queryRunner.manager.save(Wallet, wallet);
  }
  async checkWalletBalance(userId: number) {
    const balance = await this.walletRepository
      .createQueryBuilder('wallet')
      .where('wallet.userId= :userId', { userId })
      .andWhere('wallet.status= :status', { status: WalletStatus.SUCCESS })
      .andWhere('wallet.type=:type', { type: WalletType.DEPOSIT })
      .select('SUM(wallet.amount)', 'totalAmount')
      .getRawOne();
     return parseFloat(balance.totalAmount) || 0;

    
  }

  async markAsSuccess(wallet: Wallet, queryRunner: QueryRunner) {
    wallet.status = WalletStatus.SUCCESS;
    await queryRunner.manager.save(Wallet, wallet);
  }

 async validateWalletBalance(userId:number,totalPrice:number){
  const balance = await this.checkWalletBalance(userId);
  if (totalPrice >= balance) {
    throw new NotFoundException('  مبلغ کیف پول کافی نیست ');
  }
 }
}
