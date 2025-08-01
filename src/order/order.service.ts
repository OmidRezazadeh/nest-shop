import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Order } from './entities/order';
import { OrderItem } from 'src/order-item/entities/order-item';
import { plainToInstance } from 'class-transformer';
import {
  getOrderStatusKey,
  ORDER_STATUS,
} from '../common/constants/order-status';
import { DateService } from '../date/date.service';
import { orderResponseDto } from './dto/order-response-dto';
import { ListOrderDto } from './dto/list-order-dto';
import { paginate } from 'src/utils/pagination';
import { QueueService } from '../queue/queue.service';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { User } from 'src/user/entities/user.entity';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { ForbiddenException } from 'src/common/constants/custom-http.exceptions';


@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
    private readonly dataService: DateService,
    private readonly queueService: QueueService,

  ) {}



  async updateStatus(
    orderId: number,
    status: number,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(
      Order,
      { id: orderId },
      { status: status },
    );
  }

  async getOrder(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
    });
    if (!order) {
      throw new NotFoundException('سفارشی یافت نشد');
    }
    if (order.status === ORDER_STATUS.paid ) {
      throw new BadRequestException(' این سفارش قبلا پرداخت شده ')
   }
    return order;
  }

  

  /**
   * Retrieve all paid orders for a specific user by user ID.
   * @returns An array of order response DTOs for the user's paid orders
   */
  async getOrderByUserId(userId: number) {
    // Find all paid orders for the user, including related items and products
    const orders = await this.orderRepository.find({
      where: {
        user: { id: userId },
        status: ORDER_STATUS.paid,
      },
      relations: ['items', 'items.product', 'user'],
    });

    // Transform each order into the response DTO format
    return orders.map((order) =>
      plainToInstance(orderResponseDto, {
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
      }),
    );


  }

  /**
   * Validates if the order exists and if the provided status is valid.
   * Throws NotFoundException if the order or status is invalid.
   */
  async validateOrderAndStatus(status: number, id: number) {
    // Find the order by ID
    const order = await this.orderRepository.findOne({ where: { id: id } });
    if (!order) {
      // Throw if order not found
      throw new NotFoundException('سفارشی یافت نشد');
    }

    // Check if the status is valid using getOrderStatusKey
    const isValidStatus = getOrderStatusKey(status);
    if (isValidStatus === undefined) {
      // Throw if status is invalid
      throw new NotFoundException(' وضعیت وارد شده صحیح نیست');
    }
  }

  /**
   * Updates the status of an order.
   */
  async update(status: number, id: number) {
    await this.orderRepository.update({ id: id }, { status: status });
  }

  /**
   * Get a specific order by ID for a user.
   * Admins can access any order, clients can only access their own.
   */
  async getUserOrderById(orderId: number, userId: number) {
    const user = await this.userRepository.find({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(' کاربری یافت نشد');
    }
    let order: any;
    if (user[0].role.id === ROLE_NAME.Clint) {
      // Client: only access own order
       order = await this.orderRepository.findOne({
        where: { user: { id: userId }, id: orderId },
        relations: ['items', 'items.product', 'user'],
      });
      if (!order) {
        throw new ForbiddenException(
          'شما نمیتوانید به این سفارش دسترسی داشته باشید ',
        );
      }
      return this.formatOrderResponse(order, order.items);
    } else if (user[0].role.id === ROLE_NAME.Admin) {
      // Admin: access any order
      order = this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['items', 'items.product', 'user'],
      });
      if (!order) {
        throw new NotFoundException('سفارشی  یافت نشد');
      }
      return this.formatOrderResponse(order, order.items);
    }
  }

  /**
   * Create an order for a user from their cart.
   * Moves cart items to order, saves order and order items, sends notification.
   */
  async createByUserId(userId: number) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Find cart with all necessary relations
      const cart = await this.findCartByUserId(queryRunner, userId);

      // Create and save order
      const savedOrder = await this.createOrder(queryRunner, cart);

      // Create order items in batch
      await this.createOrderItems(queryRunner, savedOrder, cart.items);

      await queryRunner.commitTransaction();

      // Send notification email (async, does not block)
      this.sendOrderNotification(cart.user.email, savedOrder.total_price);

      return this.formatOrderResponse(savedOrder, cart.items);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * List orders with pagination and optional filters.
   */
  async list(listOrderDto: ListOrderDto) {
    let page = Number(listOrderDto.page) || 1;
    let limit = Number(listOrderDto.limit) || 10;
    let MAX_LIMIT = Number(process.env.MAX_LIMIT) || 100;
    limit = Math.min(limit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    // Filter by status
    if (listOrderDto.status) {
      queryBuilder.andWhere('order.status= :status', {
        status: listOrderDto.status,
      });
    }
    // Filter by price range
    if (
      listOrderDto.minPrice !== undefined &&
      listOrderDto.maxPrice !== undefined
    ) {
      queryBuilder.andWhere(
        'order.total_price BETWEEN :minPrice AND :maxPrice',
        { minPrice: listOrderDto.minPrice, maxPrice: listOrderDto.maxPrice },
      );
    } else if (listOrderDto.minPrice !== undefined) {
      queryBuilder.andWhere('order.total_price >= :minPrice', {
        minPrice: listOrderDto.minPrice,
      });
    } else if (listOrderDto.maxPrice !== undefined) {
      queryBuilder.andWhere('order.total_price <= :maxPrice', {
        maxPrice: listOrderDto.maxPrice,
      });
    }

    // Filter by product name
    if (listOrderDto.product_name) {
      queryBuilder.andWhere('product.name ILIKE :productName', {
        name: `%${listOrderDto.product_name}%`,
      });
    }
    // Get paginated orders and total count
    const [orders, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('product.id', 'DESC')
      .getManyAndCount();

    // Transform orders to response DTOs
    const data = orders.map((order) =>
      plainToInstance(orderResponseDto, {
        id: order?.id,
        status: getOrderStatusKey(order?.status),
        total_price: order?.total_price,
        created_at: order
          ? this.dataService.convertToJalali(order.created_at)
          : null,
        item: order?.items?.map((item: OrderItem) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          product: {
            id: item.product?.id,
            name: item.product?.name,
          },
        })),
      }),
    );

    return paginate(data, total, page, limit);
  }

  async getPurchaseByUserId(userId: number, listOrderDto: ListOrderDto) {
    const page = Number(listOrderDto.page) || 1;
    let limit = Number(listOrderDto.limit) || 10;
    const MAX_LIMIT = Number(process.env.MAX_LIMIT) || 100;
    limit = Math.min(limit, MAX_LIMIT);
    const skip = (page - 1) * limit;
  
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('order.status = :status', { status: ORDER_STATUS.paid })
      .orderBy('order.id', 'DESC')
      .skip(skip)
      .take(limit);
  
    const [orders, total] = await queryBuilder.getManyAndCount();
  
    const data = orders.map((order) =>
      plainToInstance(orderResponseDto, {
        id: order?.id,
        status: getOrderStatusKey(order?.status),
        total_price: order?.total_price,
        created_at: order
          ? this.dataService.convertToJalali(order.created_at)
          : null,
        item: order?.items?.map((item: OrderItem) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          product: {
            id: item.product?.id,
            name: item.product?.name,
          },
        })),
      }),
    );
  
    return paginate(data, total, page, limit);
  }
  
  /**
   * Format order and items for API response.
   */
  private formatOrderResponse(order: Order, cartItems: CartItem[]): orderResponseDto {
    return plainToInstance(orderResponseDto, {
      id: order.id,
      status: getOrderStatusKey(order.status),
      total_price: order.total_price,
      created_at: this.dataService.convertToJalali(order.created_at),
      
      items: cartItems.map((cartItem) => ({
        id: cartItem.id,
        price: cartItem.quantity * cartItem.price,
        quantity: cartItem.quantity,

        product: {
          id: cartItem.product.id,
          name: cartItem.product.name,
        },
      })),
    });
  }

  /**
   * Send order notification email using the queue.
   */
  private async sendOrderNotification(email: string, totalPrice: number) {
    await this.queueService.sendNotification({ email, price: totalPrice });
  }

  /**
   * Create order items from cart items and save them.
   */
  private async createOrderItems(
    queryRunner: QueryRunner,
    order: Order,
    cartItems: CartItem[],
  ) {
    const orderItems = cartItems.map((cartItem) =>
      queryRunner.manager.create(OrderItem, {
        order,
        price: cartItem.quantity * cartItem.price,
        quantity: cartItem.quantity,
        product: cartItem.product,
      }),
    );
    await queryRunner.manager.save(OrderItem, orderItems);
  }

  /**
   * Create and save a new order from a cart.
   */
  private async createOrder(queryRunner: QueryRunner, cart: Cart) {
    const order = queryRunner.manager.create(Order, {
      user: cart.user,
      total_price: cart.total_price,
    });

    return await queryRunner.manager.save(Order, order);
  }

  /**
   * Find a user's cart with all relations.
   * Throws if not found.
   */
  private async findCartByUserId(queryRunner: QueryRunner, userId: number) {
    const cart = await queryRunner.manager.findOne(Cart, {
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'user'],
    });
    if (!cart) {
      throw new NotFoundException('سبدی یافت نشد');
    }
    return cart;
  }
}
