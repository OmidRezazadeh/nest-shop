import { Injectable, NotFoundException } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWalletDto } from './dto/create-wallet-dto';
import { WalletStatus } from 'src/common/constants/wallet-status';
import { WalletType } from 'src/common/constants/wallet-type';
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
  async getWalletBalance(userId: number) {
    const balance = await this.walletRepository
      .createQueryBuilder('wallet')
      .select(
        'SUM(CASE WHEN wallet.type = CAST(:depositType AS wallets_type_enum) THEN wallet.amount ELSE 0 END)',
        'totalDeposit'
      )
      .addSelect(
        'SUM(CASE WHEN wallet.type = CAST(:withdrawType AS wallets_type_enum) THEN wallet.amount ELSE 0 END)',
        'totalWithdraw'
      )
      .where('wallet.userId = :userId', { userId })
      .andWhere('wallet.status = :status', { status: WalletStatus.SUCCESS })
      .setParameters({
        depositType: WalletType.DEPOSIT,   // usually 0
        withdrawType: WalletType.WITHDRAWAL_TARGET_WALLET, 
      })
      .getRawOne();
  
    const totalDeposit = parseFloat(balance.totalDeposit) || 0;
    const totalWithdraw = parseFloat(balance.totalWithdraw) || 0;
  
    return Math.max(totalDeposit - totalWithdraw, 0); 
    
  }
  
  

  async markAsSuccess(wallet: Wallet, queryRunner: QueryRunner) {
    wallet.status = WalletStatus.SUCCESS;
    await queryRunner.manager.save(Wallet, wallet);
  }

 async validateWalletBalance(userId:number,totalPrice:number){
  const balance = await this.getWalletBalance(userId);
  if (totalPrice >= balance) {
    throw new NotFoundException('  مبلغ کیف پول کافی نیست ');
  }
 }
}
