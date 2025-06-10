import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { OrderItemService } from './order-item.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';

@Controller('order-item')
export class OrderItemController {
 constructor(
    private readonly orderItemService:OrderItemService
 ){}



@UseGuards(JwtAuthGuard)
@Post('create')
async createOrderItem(@Body() createOrderItemDto: CreateOrderItemDto,  @Request() request){
     
      // Extract user ID from the authenticated request
      const userId = request.user.id;
      await this.orderItemService.validate(createOrderItemDto,userId)
      return await this.orderItemService.create(createOrderItemDto)  
    
}
    
}
