import { Injectable } from '@nestjs/common';
import { pay, verify } from '../utils/zarinPal';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaymentStatus,
  Transaction,
} from 'src/transaction/entities/transaction.entity';
import { Repository, DataSource } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
} from 'src/common/constants/custom-http.exceptions';
import { Wallet, WalletStatus } from 'src/wallet/entities/wallet.entity';
@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
  ) {}
  async pay(paymentData: any) {
    return await pay(paymentData);
  }

  async verifyPayment(authority: string, status: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { authority },
        relations: ['wallet'],
      });

      if (!transaction) throw new NotFoundException('تراکنش یافت نشد');

      if (status !== 'OK') {
        transaction.status = PaymentStatus.FAILED;
        await queryRunner.manager.save(Transaction, transaction);
        await queryRunner.commitTransaction();
        return { message: 'پرداخت لغو شد' };
      }

      const result = await verify(authority, transaction.amount);

      if (result.status === 100) {
        transaction.status = PaymentStatus.SUCCESS;
        transaction.ref_id = result.refId;
        transaction.verified_at = new Date();
        await queryRunner.manager.save(Transaction, transaction);

        const wallet = transaction.wallet;
        wallet.status = WalletStatus.SUCCESS;
        await queryRunner.manager.save(Wallet, wallet);
        await queryRunner.commitTransaction();
        return { message: 'شارژ موفق', refId: result.refId };
      } else {
        transaction.status = PaymentStatus.FAILED;
        await queryRunner.manager.save(Transaction, transaction);
        
        await queryRunner.commitTransaction();
        return { message: 'پرداخت ناموفق' };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new BadRequestException(' پرداخت با مشکل مواجه شد');
    } finally {
      await queryRunner.release();
    }
  }
}
