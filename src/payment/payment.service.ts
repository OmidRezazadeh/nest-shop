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
import { DataSource, Repository } from 'typeorm';
import { ORDER_STATUS } from 'src/common/constants/order-status';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order';
import { CartService } from 'src/cart/cart.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';




@Injectable()
export class PaymentService {
  constructor(
    private readonly  transactionService: TransactionService,
    private readonly walletService: WalletService,
     private readonly dataSource:DataSource,
     private readonly cartService: CartService,
     private readonly orderService:OrderService, 
     private readonly productService:ProductService

  ) {}

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
        if(transaction.wallet.type=== WalletType.WITHDRAW){

          await this.orderService.updateStatus(transaction.order.id,ORDER_STATUS.paid,queryRunner);
          await this.cartService.deleteByUserIdAfterPay(transaction.user.id, queryRunner);

          for (const item of transaction.order.items) {
            const {quantity}= item.product;
           const itemQuantity = quantity - item.quantity
           await this.productService.updateQuantity(item.product.id,itemQuantity,queryRunner);

          }
        
        }
         

        await this.walletService.markAsSuccess(transaction.wallet, queryRunner);
        await queryRunner.commitTransaction();
        return {
          message: ' پرداخت با موفقیت انجام شد',
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

  async pay(paymentData: any) {
    return await pay(paymentData);
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
