import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { Order } from 'src/order/entities/order';
import { ORDER_STATUS } from 'src/common/constants/order-status';
import { BadRequestException } from 'src/common/constants/custom-http.exceptions';
import { plainToInstance } from 'class-transformer';
import { ListOrderItemDto } from './dto/list-order-item.dto';
import { paginate } from 'src/utils/pagination';
import { orderItemResponseDto } from './dto/order-item-response.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly dataSource: DataSource,
  ) {}

  async validate(createOrderItemDto: CreateOrderItemDto, userId: number) {
    const order = await this.orderRepository.findOne({
      where: {
        user: { id: userId },
        status: ORDER_STATUS.paid,
        id: createOrderItemDto.order_id,
      },
    });

    if (!order) {
      throw new NotFoundException('  سفارشی یافت نشد');
    }

    const product = await this.productRepository.findOne({
      where: { id: createOrderItemDto.product_id },
    });

    if (!product) {
      throw new NotFoundException('محصولی یافت نشد');
    }

    if (createOrderItemDto.quantity > product.quantity) {
      throw new BadRequestException(' تعداد محصول کمتر از تعداد درخواستی است ');
    }
  }

  async create(createOrderItemDto: CreateOrderItemDto) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: createOrderItemDto.product_id },
      });

      if (!product) {
        throw new NotFoundException('محصولی یافت نشد');
      }

      const order = await queryRunner.manager.findOne(Order, {
        where: { id: createOrderItemDto.order_id },
      });

      if (!order) {
        throw new NotFoundException('سفارشی یافت نشد');
      }

      // Calculate total
      const productPrice = createOrderItemDto.quantity * product.price;

      // Update total price by adding new item price
      order.total_price += productPrice;
      await queryRunner.manager.save(order);

      // Create order item
      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.order = order;
      orderItem.quantity = createOrderItemDto.quantity;
      orderItem.price = product.price;

      const fullOrderItem = await queryRunner.manager.save(
        OrderItem,
        orderItem,
      );

      await queryRunner.commitTransaction();

      return plainToInstance(orderItemResponseDto, {
        id: fullOrderItem.id,
        price: fullOrderItem.price,
        quantity: fullOrderItem.quantity,
        order: {
          id: fullOrderItem.order.id,
          total_price: fullOrderItem.order.total_price,
        },
        product: {
          id: fullOrderItem.product.id,
          name: fullOrderItem.product.name,
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async list(listOrderItemDto: ListOrderItemDto = {} as ListOrderItemDto) {
    let page = Number(listOrderItemDto.page) || 1;
    let limit = Number(listOrderItemDto.limit) || 10;
    let MAX_LIMIT = Number(process.env.MAX_LIMIT) || 100;
    limit = Math.min(limit, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const query = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product');
      

    if (listOrderItemDto.order_id) {
      query.andWhere('orderItem.order_id  = :orderId', {
        orderId: listOrderItemDto.order_id,
      });
    }

    if (listOrderItemDto.product_id) {
      query.andWhere('orderItem.product_id=:productId', {
        productId: listOrderItemDto.product_id,
      });
    }
    if (listOrderItemDto.userId) {
      query.andWhere('order.userId = :userId', {
        userId: listOrderItemDto.userId,
      });
    }

    const [orderItems, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('orderItem.id', 'DESC')
      .getManyAndCount();
    const data = orderItems.map((orderItem) =>
      plainToInstance(orderItemResponseDto, {
        id: orderItem.id,
        price: orderItem.price,
        quantity: orderItem.quantity,
        order: {
          id: orderItem.order.id,
          total_price: orderItem.order.total_price,
        },
        product: orderItem.product
          ? {
              id: orderItem.product.id,
              name: orderItem.product.name,
            }
          : undefined,
      })
    );

    return paginate(data, total, page, limit);

  }
}
