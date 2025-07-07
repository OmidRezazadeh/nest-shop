import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async checkQuantityByOrderId(orderId:number) {

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items','items.product'], 
    });
    if (!order) {
      throw new NotFoundException(' سفارشی یافت نشد')
    }
  
        for(  const orderItem of order.items  ){
          if(orderItem.quantity>orderItem.product.quantity ){
              throw new BadRequestException(` تعداد کالا ${orderItem.product.name} موجود نیست `)
          }
          

        }
    // const orderItems = order.items.map((item: any) => ({
    //   quantity: item.quantity,
    //    const product =
    // }));
  }

  async validate(createOrderItemDto: CreateOrderItemDto, userId: number) {
    const order = await this.orderRepository.findOne({
      where: {
        user: { id: userId },
        status: ORDER_STATUS.pending,
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
      }),
    );

    return paginate(data, total, page, limit);
  }

  async delete(orderItemId: number, userId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItem = await queryRunner.manager.findOne(OrderItem, {
        where: { id: orderItemId },
        relations: ['order', 'order.user'],
      });

      if (!orderItem) {
        throw new NotFoundException('آیتمی یافت نشد');
      }

      if (orderItem.order.user.id !== userId) {
        throw new ForbiddenException('شما مجاز به انجام این عملیات نیستید');
      }

      const orderId = orderItem.order.id;

      const orderItemCount = await queryRunner.manager.count(OrderItem, {
        where: { order: { id: orderId } },
      });

      const order = orderItem.order;
      const orderItemTotalPrice = orderItem.price * orderItem.quantity;

      order.total_price -= orderItemTotalPrice;

      await queryRunner.manager.save(Order, order);

      await queryRunner.manager.remove(OrderItem, orderItem);

      if (orderItemCount === 1) {
        await queryRunner.manager.delete(Order, orderId);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
