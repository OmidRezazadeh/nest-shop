import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorMessage } from 'src/common/errors/error-messages';
import { QueryRunner, Repository } from 'typeorm';
import {Transaction} from 'src/transaction/entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { transactionResponseDto } from './dto/transaction-response-dto';
import { DateService } from 'src/date/date.service';
import { walletResponseDto } from 'src/wallet/dto/wallet-response-dto';
import { getPaymentStatusKey, PaymentStatus } from 'src/common/constants/transaction-status';
import { getWalletTypeKey } from 'src/common/constants/wallet-type';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
   
    private readonly dataService: DateService,
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
      relations: [    
        'wallet',
        'user',
        'order',
        'order.items',
        'order.items.product',
        'order.items.product.orderItems',
        'order.items.product.orderItems.order',
      ],
    });
    if (!transaction) {
      throw new NotFoundException(ErrorMessage.TRANSACTION.NOT_FOUND);
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

 async getUserWalletHistory(userId:number){
   const transactions= await this.transactionRepository.find({
      where:{user:{id:userId}},
      relations:['wallet'],
      order: {id:'DESC'},
    })
    return  transactions.map((transaction)=>
      plainToInstance(transactionResponseDto,{
        id:transaction.id,
        ref_id:transaction.ref_id,
        amount:transaction.amount,
        created_at:this.dataService.convertToJalali(transaction.created_at),
        wallet: plainToInstance(walletResponseDto, {
          id:transaction.wallet.id,
          status:getPaymentStatusKey(transaction.wallet.status),
          type:getWalletTypeKey(transaction.wallet.type),
          created_at:this.dataService.convertToJalali(transaction.wallet.created_at),    
        }),
      }),
    );
}
}