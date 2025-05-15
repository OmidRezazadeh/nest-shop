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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly CartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private readonly ProductRepository: Repository<Product>,

    private readonly dataSource: DataSource,
    private readonly dataService: DateService,
  ) {}

  async validate(cartDto: any, userId: number) {
    const ExitsCart = await this.CartRepository.findOne({
      where: {
        user: { id: userId },
        status: CART_STATUS.default,
      },
    });
    if (ExitsCart) {
      throw new BadRequestException(' سبد خرید دیگری وجود دارد');
    }

    for (const cart of cartDto.cart_item) {
      const product = await this.ProductRepository.findOne({
        where: { id: cart.product_id },
      });

      if (!product) {
        throw new NotFoundException('محصولی یافت نشد');
      }

      if (cartDto.quantity > product.quantity) {
        throw new BadRequestException(' تعداد محصول بیش از حد موجود است ');
      }
    }
  }

  async create(cartDto: any, userId: number) {
    let totalPrice = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const cart of cartDto.cart_item) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: cart.product_id },
        });
        if (!product) {
          throw new NotFoundException(
            `محصول با شناسه ${cart.product_id} یافت نشد`,
          );
        }

        totalPrice += Number(product.price) * cart.quantity;
      }

      const cartObject = queryRunner.manager.create(Cart, {
        user: { id: userId },
        description: cartDto.description,
        total_price: totalPrice,
      });
      const saveCart = await queryRunner.manager.save(Cart, cartObject);

      for (const cartItem of cartDto.cart_item) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: cartItem.product_id },
        });

        const saveCartItem = queryRunner.manager.create(CartItem, {
          cart: { id: saveCart.id },
          product: { id: product?.id },
          price: Number(product?.price),
          quantity: cartItem.quantity,
        });

        await queryRunner.manager.save(CartItem, saveCartItem);
      }

      await queryRunner.commitTransaction();
      const fullCart = await queryRunner.manager.findOne(Cart, {
        where: { id: saveCart.id },
        relations: ['items', 'items.product'],
      });
      const cartResponse = plainToInstance(
        CartResponseDto,
        {
          id: fullCart?.id,
          description: fullCart?.description,
          total_price: fullCart?.total_price,
          status: getCartStatusKey(fullCart?.status),
          created_at: fullCart
            ? this.dataService.convertToJalali(fullCart.created_at)
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
        { excludeExtraneousValues: true },
      );
      return cartResponse;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new BadRequestException('ثبت سبد خرید با خطا مواجه شد');
    } finally {
      await queryRunner.release();
    }
  }

  async findByUserId(userId: number) {
    return await this.CartRepository.findOne({
      where: { status: CART_STATUS.default, user: { id: userId } },
      relations: ['items'],
    });
  }

  async checkExistsCart(userId: number) {
    const cart = await this.CartRepository.findOne({
      where: {
        user: { id: userId },
        status: CART_STATUS.default,
      },
    });
    if (!cart) {
      throw new NotFoundException('سبد خریدی یافت نشد');
    }


  }

  async deleteByUserId(userId:number){
    await this.CartRepository.delete({user:{id:userId}})
  }
}
