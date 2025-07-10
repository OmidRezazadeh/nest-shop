import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order';
import { JwtModule } from '@nestjs/jwt';
import { Cart } from 'src/cart/entities/cart.entity';
import { OrderItem } from 'src/order-item/entities/order-item';
import { DateService } from 'src/date/date.service';
import { QueueModule } from 'src/queue/queue.module';
import { User } from 'src/user/entities/user.entity';
import { OrderItemService } from 'src/order-item/order-item.service';
import { Product } from 'src/product/entities/product.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { CartService } from 'src/cart/cart.service';
import { Log } from 'src/logs/entities/log.entity';
import { LogsService } from 'src/logs/logs.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';


@Module({
  imports:[TypeOrmModule.forFeature([Order,Cart,OrderItem,User,Product,Wallet,Log,Transaction]),
  JwtModule.registerAsync({
    useFactory:()=>({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
    })
  }),
  QueueModule,
],
  providers: [OrderService,DateService,OrderItemService,WalletService,CartService,LogsService,TransactionService],
  controllers: [OrderController],
  exports: [OrderService], 
})
export class OrderModule {}
