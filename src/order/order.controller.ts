import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { ListOrderDto } from './dto/list-order-dto';


@Controller('order')
export class OrderController {
constructor(private readonly orderService:OrderService){}

@UseGuards(JwtAuthGuard)
@Post('create')
async create(@Request() request){
  const userId = request.user.id;
  return await this.orderService.createByUserId(userId);
}
@UseGuards(UseGuards)
@Roles(ROLE_NAME.Admin) 
@Get('list')
async getAllOrders(@Query() listOrderDto:ListOrderDto){

return await this.orderService.list(listOrderDto);
}	

}
