import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { User } from './user/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { ProfileModule } from './profile/profile.module';
import { Profile } from './profile/entities/profile';
import { IsUniqueConstraint } from './common/decorators/is-unique-constraint';
import { ConfirmationCodeModule } from './confirmation-code/confirmation-code.module';
import { confirmationCode } from './confirmation-code/entities/confirmationCode';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { Photo } from './upload/entities/photo.entity';
import { DateService } from './date/date.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { TagModule } from './tag/tag.module';
import { Tag } from './tag/entities/tag.entity';
import { ProductModule } from './product/product.module';
import { RedisModule } from './redis/redis.module';
import { ProductTagModule } from './product-tag/product-tag.module';
import { ProductTag } from './product-tag/entities/product-tag.entity';
import { Product } from './product/entities/product.entity';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart-item/entities/cart-item.entity';
import { UniqueProductIds } from './validators/unique-product-id.validator';
import { LogsModule } from './logs/logs.module';
import { Log } from './logs/entities/log.entity';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { Order } from './order/entities/order';
import { OrderItem } from './order-item/entities/order-item';
import { EventEmitterModule } from '@nestjs/event-emitter';


import { QueueModule } from './queue/queue.module';


dotenv.config();
@Module({


  imports: [
  
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'login', 
          ttl: 60000,
          limit: 3,
        },
      ],
    
    
    }),


    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Log]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User,Role,Profile,confirmationCode,Photo,Tag,ProductTag,Product,Cart,CartItem,Log,Order,OrderItem], 
      synchronize: true,
    }), 
    UserModule, 
    RoleModule,
    AuthModule,
    ProfileModule,
    ConfirmationCodeModule,
    EmailModule,
    UploadModule,
    TagModule,
    ProductModule,
    RedisModule,
    ProductTagModule,
    CartModule,
    CartItemModule,
    LogsModule,
    OrderModule,
    QueueModule,
    OrderItemModule
  
    ],
  controllers: [AppController],
  providers: [
    AppService,IsUniqueConstraint, DateService,UniqueProductIds
  ],
})
export class AppModule {}
