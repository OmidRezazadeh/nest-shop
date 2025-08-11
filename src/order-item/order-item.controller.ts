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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { orderItemResponseDto } from './dto/order-item-response.dto';
import { OrderItemListResponseDto } from './dto/order-item-list-response.dto';

@ApiTags('Order Items')
@ApiBearerAuth()
@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create order item' })
  @ApiBody({ type: CreateOrderItemDto })
  @ApiOkResponse({ type: orderItemResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'List order items' })
  @ApiOkResponse({ type: OrderItemListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getItemsByOrderId(@Query() listOrderItemDto: ListOrderItemDto) {
    return await this.orderItemService.list(listOrderItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete order item' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async delete(
      @Param('id') orderItemId: number,
      @Request() request
) {
      const userId = request.user.id;
     await this.orderItemService.delete(orderItemId,userId);
     return {"message":" ایتم مورد نظر حذف شده "}
  }
}
