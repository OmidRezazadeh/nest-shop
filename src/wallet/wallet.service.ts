import { Injectable } from '@nestjs/common';
import { Wallet, WalletStatus, WalletType } from './entities/wallet.entity';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async create(queryRunner,amount: number, userId: number) {
    const wallet = queryRunner.manager.create(Wallet,{
      amount: amount,
      user: { id: userId },
      status: WalletStatus.PENDING,
      type: WalletType.DEPOSIT,
    });
    return await queryRunner.manager.save(Wallet,wallet);
  }
  async markAsSuccess(wallet:Wallet,queryRunner:QueryRunner){
    wallet.status = WalletStatus.SUCCESS;
    await queryRunner.manager.save(Wallet, wallet);
  
  }

}
