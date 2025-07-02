import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import {
  PaymentStatus,
  Transaction,
} from 'src/transaction/entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}
  async create(queryRunner: QueryRunner, transactionData: any) {
    const transaction = queryRunner.manager.create(
      Transaction,
      transactionData,
    );
    await queryRunner.manager.save(Transaction, transaction);
  }

  async findByAuthority(authority: string, queryRunner: QueryRunner) {
    const transaction = await queryRunner.manager.findOne(Transaction, {
      where: { authority },
      relations: ['wallet'],
    });
    if (!transaction) {
      throw new NotFoundException('تراکنش یافت نشد');
    }
    return transaction;
  }

  async markAsSuccess(
    transaction: Transaction,
    refId: string,
    queryRunner: QueryRunner,
  ) {
    transaction.status = PaymentStatus.SUCCESS;
    transaction.ref_id = refId;
    transaction.verified_at = new Date();
    await queryRunner.manager.save(Transaction, transaction);
  }

  async markAsFailed(transaction: Transaction, queryRunner: QueryRunner) {
    transaction.status = PaymentStatus.FAILED;
    await queryRunner.manager.save(Transaction, transaction);
  }
}
