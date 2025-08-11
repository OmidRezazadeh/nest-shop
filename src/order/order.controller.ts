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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { ListOrderDto } from './dto/list-order-dto';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { payOrderDto } from './dto/pay-order-dto';
import { DataSource } from 'typeorm';
import { OrderItemService } from 'src/order-item/order-item.service';
import { WalletService } from '../wallet/wallet.service';
import { PaymentMethod } from '../common/constants/payment-method.enum';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet-dto';
import { ORDER_STATUS } from 'src/common/constants/order-status';
import { CartService } from 'src/cart/cart.service';
import { pay } from '../utils/zarinPal';
import { TransactionService } from 'src/transaction/transaction.service';
import { WalletStatus } from 'src/common/constants/wallet-status';
import { WalletType } from 'src/common/constants/wallet-type';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly walletService: WalletService,
    private readonly cartService: CartService,
    private readonly transactionService:TransactionService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('user-purchase')
  @ApiOperation({ summary: 'Get the current user purchases' })
  async purchase(@Request() request, @Query() listOrderDto: ListOrderDto){
    const  userId = request.user.id;
    return await this.orderService.getPurchaseByUserId(userId,listOrderDto)
 }

 
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard)
  @Post('/:id/pay')
  @ApiOperation({ summary: 'Pay an order by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: payOrderDto })
  async pay(
    @Request() request,
    @Param('id') orderId: number,
    @Body() payOrderDto: payOrderDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
    
      const userId = request.user.id;
      const order = await this.orderService.getOrder(orderId, userId);
  
      await this.orderItemService.checkQuantityByOrderId(orderId);  

      const walletData = {
        amount: order.total_price,
        userId,
        status: WalletStatus.SUCCESS,
      };
      let walletPayload: CreateWalletDto;
      if (payOrderDto.paymentMethod === PaymentMethod.WALLET) {
        await this.walletService.validateWalletBalance(userId,order.total_price);
        walletPayload  ={... walletData, type: WalletType.WITHDRAWAL_TARGET_WALLET} 
        await this.walletService.create(queryRunner, walletPayload);
        await this.orderService.updateStatus(order.id,ORDER_STATUS.paid,queryRunner);
        await this.cartService.deleteByUserIdAfterPay(userId, queryRunner);
        await queryRunner.commitTransaction();
        return{"message": " خرید با موفقیت انجام شد"}
      }else{
        walletPayload  ={... walletData, type: WalletType.WITHDRAW} 
        const wallet=  await this.walletService.create(queryRunner,walletPayload)
        
        const result = await pay(order);
     
          const transactionData = {
            user: { id: userId },
            wallet: { id: wallet.id },
            amount: wallet.amount,
            authority: result.authority,
            gateway: 'ZARINPAL',
            order:{id:order.id}
          };
          await this.transactionService.create(queryRunner, transactionData);
          await queryRunner.commitTransaction();
          return result.url;
      }
 
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
        await queryRunner.release();
      }
    }
  

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create an order for current user' })
  async create(@Request() request) {
    // Extract user ID from the authenticated request
    const userId = request.user.id;

    // Call the order service to create a new order for the user
    return await this.orderService.createByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.Admin)
  @Get('list')
  @ApiOperation({ summary: 'List all orders (admin)' })
  async getAllOrders(@Query() listOrderDto: ListOrderDto) {
    // Call the order service to retrieve a list of all orders based on query parameters
    return await this.orderService.list(listOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order by id (current user)' })
  @ApiParam({ name: 'id', type: Number })
  async getOrderById(@Request() request, @Param('id') orderId: number) {
    // Extract user ID from the authenticated request
    const userId = request.user.id;

    // Call the order service to get the order that belongs to the user
    return await this.orderService.getUserOrderById(orderId, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.Admin)
  @Put('update-status/:id')
  @ApiOperation({ summary: 'Update order status (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { status: { type: 'number', example: 1 } } } })
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
  @ApiOperation({ summary: 'Get all paid orders for a user (admin)' })
  @ApiParam({ name: 'user_id', type: Number })
  async getOrderByUserId(@Param('user_id') userId: number) {
    return await this.orderService.getOrderByUserId(userId);
  }
}
