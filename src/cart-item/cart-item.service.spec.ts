import { Test, TestingModule } from '@nestjs/testing';
import { CartItemService } from './cart-item.service';

describe('CartItemService', () => {
  let service: CartItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartItemService],
    }).compile();

    service = module.get<CartItemService>(CartItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
