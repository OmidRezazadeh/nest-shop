// order-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order } from 'src/order/entities/order';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_STATUS } from 'src/common/constants/order-status';
import { LessThan } from 'typeorm';

@Injectable()
export class OrderCleanupService {
  private readonly logger = new Logger(OrderCleanupService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cancelExpiredOrders() {
    const expirationTime = new Date(Date.now() - 15 * 60 * 1000);
    const expiredOrders = await this.orderRepository.find({
      where: {
        status: ORDER_STATUS.pending,
        created_at: LessThan(expirationTime),
      },
    });

    if (expiredOrders.length > 0) {
      for (const order of expiredOrders) {
        order.status = ORDER_STATUS.cancelled;
        await this.orderRepository.save(order);
        this.logger.log(`Cancelled expired order ID: ${order.id}`);
      }
    }
  }
}
