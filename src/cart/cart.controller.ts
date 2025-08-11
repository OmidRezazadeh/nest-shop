import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CartDto } from './dto/create-cart.dto';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { RedisService } from 'src/redis/redis.service';
import { RedisKeys } from 'src/redis/redis-keys-constants';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('cart')
@ApiBearerAuth()
@ApiExtraModels(CartResponseDto)
@Controller('cart')
export class CartController {
  constructor(
    private readonly redisService: RedisService,
    private readonly cartService: CartService,
  ) {}

  // This route retrieves the current user's cart.
  // It first checks Redis cache. If not found, it loads from the database and caches it.
  @Get()
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard) // Ensure user is authenticated and verified
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiOkResponse({
    description: 'Returns the current user cart if exists; otherwise null',
    schema: {
      type: 'object',
      properties: {
        cart: {
          $ref: getSchemaPath(CartResponseDto),
          nullable: true,
        },
      },
    },
  })
  async getCart(@Request() request) {
    const userId = request.user.id; // Extract user ID from the JWT token

    // Define the Redis key for this user's cart
    const key = `${RedisKeys.CART_ID}:${userId}`;

    // Try to retrieve the cart from Redis cache
    let cart = await this.redisService.getValue(key);

    // If cart is not in Redis, fetch from database
    if (!cart) {
      const dbCart = await this.cartService.getCartByUserId(userId);

      // If cart exists in DB, cache it in Redis
      if (dbCart) {
        await this.redisService.setValue(key, JSON.stringify(dbCart)); // Save to Redis
        cart = JSON.stringify(dbCart); // Assign to local variable for return
      }
    }

    // Return the cart (parsed from string if found, otherwise null)
    return { cart: cart ? JSON.parse(cart) : null };
  }

  // Create a new cart for the authenticated and verified user
  @UseGuards(JwtAuthGuard, CheckVerifiedGuard) // Ensure the user is authenticated and verified before creating a cart
  @Post('store')
  @ApiOperation({ summary: 'Create a cart for current user' })
  @ApiBody({ type: CartDto })
  @ApiCreatedResponse({
    description: 'Cart created successfully',
    schema: {
      type: 'object',
      properties: {
        cart: { $ref: getSchemaPath(CartResponseDto) },
      },
    },
  })
  async create(
    @Body() cartDto: CartDto, // Cart data sent from client (items, description, etc.)
    @Request() request, // Request object to access the current user
  ) {
    const userId = request.user.id; // Extract user ID from the authenticated request

    // Validate the incoming cart data and check if user can create a cart (e.g., no existing active cart)
    await this.cartService.validate(cartDto, userId);

    // Create the cart in the database using the validated data
    const cart = await this.cartService.create(cartDto, userId);

    // Define the Redis cache key for this user's cart
    const key = `${RedisKeys.CART_ID}:${userId}`;

    // Cache the newly created cart data in Redis as a JSON string for quick future access
    await this.redisService.setValue(key, JSON.stringify(cart));

    // Return the created cart data as the response
    return { cart };
  }

  @UseGuards(JwtAuthGuard, CheckVerifiedGuard) // Ensure user is authenticated and verified before deleting the cart
  @Delete('delete')
  @ApiOperation({ summary: 'Delete current user cart' })
  @ApiOkResponse({
    description: 'Cart deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'سبد خرید با موفقیت حذف شد' },
      },
    },
  })
  async delete(@Request() request) {
    const userId = request.user.id; // Extract user ID from the authenticated request

    // Check if the user has an existing active cart to delete
    await this.cartService.checkExistsCart(userId);

    // Delete the cart associated with the user from the database
    await this.cartService.deleteByUserId(userId);

    // Define the Redis cache key for this user's cart
    const key = `${RedisKeys.CART_ID}:${userId}`;

    // Remove the cached cart data from Redis to keep cache consistent
    await this.redisService.deleteValue(key);

    // Return a success message confirming cart deletion
    return { message: 'سبد خرید با موفقیت حذف شد' };
  }
}
