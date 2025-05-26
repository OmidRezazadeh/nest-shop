import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';


@Controller('order')
export class OrderController {
constructor(private readonly orderService:OrderService){}

@UseGuards(JwtAuthGuard)
@Post('create')
async create(@Request() request){
  const userId = request.user.id;
  console.log(userId);
  return await this.orderService.createByUserId(userId);
 
}
}
