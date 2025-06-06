import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { ListOrderDto } from './dto/list-order-dto';
import { RolesGuard } from 'src/guards/Role/role/role.guard';


@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}



@UseGuards(JwtAuthGuard)
@Post('create')
async create(@Request() request) {
  // Extract user ID from the authenticated request
  const userId = request.user.id;

  // Call the order service to create a new order for the user
  return await this.orderService.createByUserId(userId);
}


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_NAME.Admin)
@Get('list')
async getAllOrders(@Query() listOrderDto: ListOrderDto) {
  // Call the order service to retrieve a list of all orders based on query parameters
  return await this.orderService.list(listOrderDto);
}


@UseGuards(JwtAuthGuard)
@Get(':id')
async getOrderById(@Request() request, @Param('orderId') orderId: number) {
  // Extract user ID from the authenticated request
  const userId = request.user.id;

  // Call the order service to get the order that belongs to the user
  return await this.orderService.getUserOrderById(orderId, userId);
}




  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.Admin)
  @Put('update-status/:id')
  async updateOrderStatus(
    @Param('id') id: number,
    @Body('status') status: number,
  ) {
    // Validate the order and new status
    await this.orderService.validateOrderAndStatus(status, id);
    // Update the order status
    await this.orderService.update(status, id);
    // Return success message
    return {
      message: ' وضعیت سفارش با موفقیت بروز رسانی شد',
    };
  }

  /**
   * Get all paid orders for a specific user by user ID.
   * Only accessible by users with Admin role.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.Admin)
  @Get('user-id/:user_id')
  async getOrderByUserId(@Param('user_id') userId: number) {
    return await this.orderService.getOrderByUserId(userId);
  }
}
