import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { ListOrderDto } from './dto/list-order-dto';
import { get } from 'http';
import { RolesGuard } from 'src/guards/Role/role/role.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Request() request) {
    const userId = request.user.id;
    return await this.orderService.createByUserId(userId);
  }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin) 
  @Get('list')
  async getAllOrders(@Query() listOrderDto: ListOrderDto) {
    return await this.orderService.list(listOrderDto);
  }


  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrderById(@Request() request,  @Param('orderId') orderId: number){
     const userId = request.user.id;
    return await this.orderService.getUserOrderById(orderId,userId);


      

}

}
