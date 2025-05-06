import { Test, TestingModule } from '@nestjs/testing';
import { CartItemController } from './cart-item.controller';

describe('CartItemController', () => {
  let controller: CartItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartItemController],
    }).compile();

    controller = module.get<CartItemController>(CartItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
