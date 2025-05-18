import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { DataSource, Repository } from 'typeorm';
import { DateService } from '../date/date.service';
import { CartItem } from '../cart-item/entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';
import { plainToInstance } from 'class-transformer';
import { CartResponseDto } from './dto/cart-response.dto';
import { getCartStatusKey } from 'src/common/constants/cart-status';
import { CART_STATUS } from '../common/constants/cart-status';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly CartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private readonly ProductRepository: Repository<Product>,

    private readonly dataSource: DataSource,
    private readonly dataService: DateService,
    private readonly logsService:LogsService
  ) {}

// This method validates the incoming cart before creation:
// - Checks if the user already has an open (default) cart.
// - Verifies that each product in the cart exists and has enough quantity.
async validate(cartDto: any, userId: number) {
  // Check if the user already has an open cart (status = default)
  const ExitsCart = await this.CartRepository.findOne({
    where: {
      user: { id: userId },
      status: CART_STATUS.default,
    },
  });

  // If a default cart already exists, prevent creating another one
  if (ExitsCart) {
    throw new BadRequestException('سبد خرید دیگری وجود دارد'); // "Another cart already exists"
  }

  // Loop through each item in the cart DTO to validate products
  for (const cart of cartDto.cart_item) {
    // Check if the product exists
    const product = await this.ProductRepository.findOne({
      where: { id: cart.product_id },
    });

    // If the product doesn't exist, throw an error
    if (!product) {
      throw new NotFoundException('محصولی یافت نشد'); // "Product not found"
    }

    // Check if requested quantity exceeds available stock
    if (cart.quantity > product.quantity) {
      throw new BadRequestException('تعداد محصول بیش از حد موجود است'); // "Requested quantity exceeds stock"
    }
  }
}






// This method creates a new shopping cart with its items for a specific user.
// It uses a database transaction to ensure data consistency in case of failure.
async create(cartDto: any, userId: number) {
  let totalPrice = 0;

  // Create a query runner for manual transaction management
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect(); // Connect the runner to the DB
  await queryRunner.startTransaction(); // Start transaction block

  try {
    // Calculate total price by looping through each cart item in the DTO
    for (const cart of cartDto.cart_item) {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: cart.product_id },
      });

      // If product not found, throw a 404 error
      if (!product) {
        throw new NotFoundException(
          `محصول با شناسه ${cart.product_id} یافت نشد`, // "Product with ID ... not found"
        );
      }

      // Accumulate total price based on product price and quantity
      totalPrice += Number(product.price) * cart.quantity;
    }

    // Create the Cart entity object with user, description, and calculated total price
    const cartObject = queryRunner.manager.create(Cart, {
      user: { id: userId },
      description: cartDto.description,
      total_price: totalPrice,
    });

    // Save the cart to the database
    const saveCart = await queryRunner.manager.save(Cart, cartObject);

    // Loop through each cart item again to create and save them in the database
    for (const cartItem of cartDto.cart_item) {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: cartItem.product_id },
      });

      // Create a new CartItem object linked to the saved cart and product
      const saveCartItem = queryRunner.manager.create(CartItem, {
        cart: { id: saveCart.id },
        product: { id: product?.id },
        price: Number(product?.price),
        quantity: cartItem.quantity,
      });

      // Save the CartItem entity in the database
      await queryRunner.manager.save(CartItem, saveCartItem);
     
    }
    await this.logsService.log(
      'سبد خرید با موفقیت ساخته شد',
      'CartService'
    )

    // Commit the transaction if all operations succeed
    await queryRunner.commitTransaction();

    // After commit, fetch the full cart including items and products for the response
    const fullCart = await queryRunner.manager.findOne(Cart, {
      where: { id: saveCart.id },
      relations: ['items', 'items.product'],
    });

    // Convert the cart entity to a DTO using class-transformer
    const cartResponse = plainToInstance(
      CartResponseDto,
      {
        id: fullCart?.id,
        description: fullCart?.description,
        total_price: fullCart?.total_price,
        status: getCartStatusKey(fullCart?.status), // Convert status enum to readable key
        created_at: fullCart
          ? this.dataService.convertToJalali(fullCart.created_at) // Convert date to Jalali
          : null,
        item:
          fullCart?.items?.map((item: any) => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            product: {
              id: item.product?.id,
              name: item.product?.name,
            },
          })) || [],
      },
      { excludeExtraneousValues: true }, // Only include fields defined in CartResponseDto
    );

    // Return the cart as a formatted response
    return cartResponse;

  } catch (error) {
    // If any error occurs during transaction, rollback all DB operations
    await queryRunner.rollbackTransaction();
    console.error(error); // Log the error for debugging
    throw new BadRequestException('ثبت سبد خرید با خطا مواجه شد'); // "Failed to create cart"
  } finally {
    // Always release the query runner whether success or error
    await queryRunner.release();
  }
}


// This method retrieves the current active cart of a user by their userId,
// transforms it into a response DTO, and returns it in a user-friendly format.
async getCartByUserId(userId: number) {
  
  // Find the user's active cart (with default status), including:
  // - Related 'items' in the cart
  // - Each item's related 'product' details
  const cart = await this.CartRepository.findOne({
    where: {
      user: { id: userId },
      status: CART_STATUS.default,
    },
    relations: ['items', 'items.product'], // Eager-load items and their associated product
  });

  // If no cart is found, throw a 400 BadRequest exception
  if (!cart) {
    throw new BadRequestException('سبد خرید وجود ندارد'); // "Cart does not exist"
  }

  // Transform the raw cart entity into a response DTO using class-transformer
  const cartResponse = plainToInstance(
    CartResponseDto,
    {
      id: cart?.id,
      description: cart?.description,
      total_price: cart?.total_price,
      // Convert the status enum to a readable key (e.g., 'default', 'completed')
      status: getCartStatusKey(cart?.status),
      // Convert Gregorian date to Jalali (Persian) format using a utility service
      created_at: cart
        ? this.dataService.convertToJalali(cart.created_at)
        : null,
      // Map cart items to include only essential fields: id, price, quantity, and product details
      item: cart?.items?.map((item: any) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        product: {
          id: item.product?.id,
          name: item.product?.name,
        },
      })) || [],
    },
    { excludeExtraneousValues: true }, // Ensure only properties defined in DTO are included
  );

  // Return the formatted cart response
  return cartResponse;
}


// This method retrieves the user's current (default status) cart from the database,
// including its related cart items.
async findByUserId(userId: number) {
  
  // Perform a database query to find one cart where:
  // - The cart status is set to the default (usually means "active" or "in-progress")
  // - The user ID matches the provided userId
  // Also, fetch the related "items" (cart items) using the relations option
  return await this.CartRepository.findOne({
    where: { 
      status: CART_STATUS.default, 
      user: { id: userId } 
    },
    relations: ['items'], // Eager-load the associated cart items
  });
}

// This method checks if a cart exists for a specific user with the default status
async checkExistsCart(userId: number) {
  
  // Search for a cart in the database where:
  // - The user ID matches the given userId
  // - The cart status is set to the default status (e.g., active/in-progress cart)
  const cart = await this.CartRepository.findOne({
    where: {
      user: { id: userId },
      status: CART_STATUS.default,
    },
  });

  // If no such cart is found, throw a 404 Not Found exception
  if (!cart) {
    throw new NotFoundException('سبد خریدی یافت نشد'); // "No cart found"
  }
}


// This method deletes the cart that belongs to a specific user by their user ID
async deleteByUserId(userId: number) {
  // Perform a delete operation in the Cart table where the user ID matches
  await this.CartRepository.delete({ user: { id: userId } });
  await this.logsService.log('سبد خرید با موفقیت حذف شد', 'CartService');

}

}
