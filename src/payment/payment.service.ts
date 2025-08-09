import { Injectable } from '@nestjs/common';
import { pay, verify } from '../utils/zarinPal';
import {
  BadRequestException
} from 'src/common/constants/custom-http.exceptions';
import { TransactionService } from 'src/transaction/transaction.service';
import { WalletService } from 'src/wallet/wallet.service';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet-dto';
import { DataSource } from 'typeorm';
import { ORDER_STATUS } from 'src/common/constants/order-status';
import { ErrorMessage } from 'src/common/errors/error-messages';
import { CartService } from 'src/cart/cart.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { WalletStatus } from 'src/common/constants/wallet-status';
import { WalletType } from 'src/common/constants/wallet-type';




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
        return { message: ErrorMessage.PAYMENT.CANCELED };
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
          message: ErrorMessage.PAYMENT.SUCCESS,
          refId: result.refId,
        };
      } else {
        await this.transactionService.markAsFailed(transaction, queryRunner);
        await queryRunner.commitTransaction();
        return { message: ErrorMessage.PAYMENT.FAILED };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new BadRequestException(ErrorMessage.PAYMENT.ERROR);
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
      throw new BadRequestException(ErrorMessage.PAYMENT.ERROR);
    } finally {
      await queryRunner.release();
    }
  }

}
