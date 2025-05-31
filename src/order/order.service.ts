import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Order } from './entities/order';
import { OrderItem } from 'src/order-item/entities/order-item';
import { plainToInstance } from 'class-transformer';
import { getOrderStatusKey } from '../common/constants/order-status';
import { DateService } from '../date/date.service';
import { orderResponseDto } from './dto/order-response-dto';
import { ListOrderDto } from './dto/list-order-dto';
import { skip } from 'node:test';
import { paginate } from 'src/utils/pagination';

import { QueueService } from '../queue/queue.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
   
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    
    private readonly dataSource: DataSource,
    private readonly dataService: DateService,

    private readonly queueService:QueueService

  ) {}

  async createByUserId(userId: number) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product', 'user'],
      });

      if (!cart) {
        throw new NotFoundException('سبدی یافت نشد ');
      }

      const order = queryRunner.manager.create(Order, {
        user: cart.user,
        total_price: cart.total_price,
      });
       const savedOrder = await queryRunner.manager.save(Order, order); 

      for (const cartItem of cart.items) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: order,
          price: cartItem.quantity * cartItem.price,
          quantity: cartItem.quantity,
          product: cartItem.product,
        });
        await queryRunner.manager.save(OrderItem, orderItem);
      }

      await queryRunner.commitTransaction();

      const fullOrder = await queryRunner.manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.product'],
      });
      const orderResponse = plainToInstance(orderResponseDto, {
        id: fullOrder?.id,
        status: getOrderStatusKey(fullOrder?.status),
        total_price:fullOrder?.total_price,
        created_at: fullOrder
          ? this.dataService.convertToJalali(fullOrder.created_at)
          : null,
        item: fullOrder?.items?.map((item: any) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          product: {
            id: item.product?.id,
            name: item.product?.name,
          },
        })),
      });
       await this.queueService.sendNotification({email:cart.user.email, price:savedOrder.total_price});




      return orderResponse;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

 async list(listOrderDto:ListOrderDto){
    let page = Number(listOrderDto.page) || 1;
    let limit = Number(listOrderDto.limit) || 10;
    let MAX_LIMIT = Number(process.env.MAX_LIMIT) || 100;
    limit = Math.min(limit, MAX_LIMIT);
     const skip = (page - 1) * limit;
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
     .leftJoinAndSelect('order.items', 'items')
     .leftJoinAndSelect('items.product', 'product')



    if (listOrderDto.status) {
       queryBuilder.andWhere('order.status= :status',{status :listOrderDto.status})
    }
if (listOrderDto.minPrice !== undefined && listOrderDto.maxPrice !== undefined) {
  queryBuilder.andWhere(
    'order.total_price BETWEEN :minPrice AND :maxPrice',
    { minPrice: listOrderDto.minPrice, maxPrice: listOrderDto.maxPrice }
  );
}
 else if (listOrderDto.minPrice !== undefined) {
  queryBuilder.andWhere('order.total_price >= :minPrice', { minPrice: listOrderDto.minPrice });

} else if (listOrderDto.maxPrice !== undefined) {
  queryBuilder.andWhere('order.total_price <= :maxPrice', { maxPrice: listOrderDto.maxPrice });
}






  if (listOrderDto.product_name) {
    queryBuilder.andWhere('product.name ILIKE :productName',{name:`%${listOrderDto.product_name}%`})
    
  }
  const [orders,total] =await queryBuilder
  .skip(skip)
  .take(limit)
  .orderBy('product.id', 'DESC')
  .getManyAndCount();


     const data = orders.map(order => plainToInstance(orderResponseDto, {
         id: order?.id,
         status: getOrderStatusKey(order?.status),
         total_price: order?.total_price,
         created_at: order
           ? this.dataService.convertToJalali(order.created_at)
           : null,
         item: order?.items?.map((item: any) => ({
           id: item.id,
           price: item.price,
           quantity: item.quantity,
           product: {
             id: item.product?.id,
             name: item.product?.name,
           },
         })),
       })
     );



  return paginate (data,total,page,limit)

}

}
