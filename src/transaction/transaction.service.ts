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
  async create(queryRunner:QueryRunner,transactionData: any) {
    const transaction = queryRunner.manager.create(Transaction,transactionData);
    await  queryRunner.manager.save(Transaction,transaction);
  }  
}
