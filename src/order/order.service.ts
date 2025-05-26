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
const savedOrder = await queryRunner.manager.save(Order, order); // ✅ Save first

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

      return orderResponse;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
