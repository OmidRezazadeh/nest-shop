import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { PaymentService } from './payment.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { PaymentController } from './payment.controller';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { OrderModule } from 'src/order/order.module';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartModule } from 'src/cart/cart.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet,Cart]),
    forwardRef(() => TransactionModule),
    forwardRef(() => WalletModule),
    forwardRef(() => CartModule),
    forwardRef(() => OrderModule),
    forwardRef(()=>ProductModule)
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService], 
})
export class PaymentModule {}
