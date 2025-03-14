import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmationCodeService } from './confirmation-code.service';

describe('ConfirmationCodeService', () => {
  let service: ConfirmationCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfirmationCodeService],
    }).compile();

    service = module.get<ConfirmationCodeService>(ConfirmationCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
