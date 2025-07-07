import { Injectable } from '@nestjs/common';
import { pay, verify } from '../utils/zarinPal';
import {
  BadRequestException,
  NotFoundException,
} from 'src/common/constants/custom-http.exceptions';
import {
  WalletStatus,
  WalletType,
} from 'src/wallet/entities/wallet.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { WalletService } from 'src/wallet/wallet.service';
import { payOrderDto } from 'src/order/dto/pay-order-dto';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet-dto';
import { DataSource } from 'typeorm';



@Injectable()
export class PaymentService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
     private readonly dataSource:DataSource

  ) {}


  
  // async payOrder(order: any, payOrderDto: payOrderDto, userId: number) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
      


  //   //       //  await this.orderItemService.checkQuantityByOrderId(order.id)

  //       const walletData:CreateWalletDto={
  //         amount: totalPrice,
  //         userId,
  //         status: WalletStatus.SUCCESS,
  //         type: WalletType.WITHDRAW,
  //       }
  //       await this.walletService.create(queryRunner, walletData);
  //       await this.orderService.updateStatus(order.id,ORDER_STATUS.paid,queryRunner)
  //   //     await this.cartService.deleteByUserIdAfterPay(userId,queryRunner)
 
  //     } else {
  //     }
  //   } catch (error) {}
  // }

  async pay(paymentData: any) {
    return await pay(paymentData);
  }

  async verifyPayment(authority: string, status: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await this.transactionService.findByAuthority(
        authority,
        queryRunner,
      );
      if (status !== 'OK') {
        await this.transactionService.markAsFailed(transaction, queryRunner);
        await queryRunner.commitTransaction();
        return { message: 'پرداخت لغو شد' };
      }

      const result = await verify(authority, transaction.amount);
      if (result.status === 100) {
        await this.transactionService.markAsSuccess(
          transaction,
          result.refId,
          queryRunner,
        );
        await this.walletService.markAsSuccess(transaction.wallet, queryRunner);
        await queryRunner.commitTransaction();
        return {
          message: 'شارژ  کیف پول با موفقیت انجام شد',
          refId: result.refId,
        };
      } else {
        await this.transactionService.markAsFailed(transaction, queryRunner);
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

  async charge(amount: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const  walletData:CreateWalletDto= {
        amount,
        userId,
        status: WalletStatus.PENDING,
        type: WalletType.DEPOSIT,
      };
      const wallet = await this.walletService.create(queryRunner, walletData);
      const result = await this.pay(wallet);

      const transactionData = {
        user: { id: userId },
        wallet: { id: wallet.id },
        amount: wallet.amount,
        authority: result.authority,
        gateway: 'ZARINPAL',
      };
      await this.transactionService.create(queryRunner, transactionData);
      await queryRunner.commitTransaction();
      return result.url;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new BadRequestException(' پرداخت با مشکل مواجه شد');
    } finally {
      await queryRunner.release();
    }
  }

}
