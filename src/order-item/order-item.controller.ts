import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { OrderItemService } from './order-item.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from '../common/constants/role-name';
import { ListOrderItemDto } from './dto/list-order-item.dto';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createOrderItem(
    @Body() createOrderItemDto: CreateOrderItemDto,
    @Request() request,
  ) {
    const userId = request.user.id;
    await this.orderItemService.validate(createOrderItemDto, userId);
    return await this.orderItemService.create(createOrderItemDto);
  }

  @Roles(ROLE_NAME.Admin)
  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getItemsByOrderId(@Query() listOrderItemDto: ListOrderItemDto) {
    return await this.orderItemService.list(listOrderItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async delete(
      @Param('id') orderItemId: number,
      @Request() request
) {
      const userId = request.user.id;
     await this.orderItemService.delete(orderItemId,userId);
     return {"message":" ایتم مورد نظر حذف شده "}
  }
}
