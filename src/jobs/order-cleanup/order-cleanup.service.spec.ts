import { Test, TestingModule } from '@nestjs/testing';
import { OrderCleanupService } from './order-cleanup.service';

describe('OrderCleanupService', () => {
  let service: OrderCleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderCleanupService],
    }).compile();

    service = module.get<OrderCleanupService>(OrderCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
