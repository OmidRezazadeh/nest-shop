import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmationCodeController } from './confirmation-code.controller';

describe('ConfirmationCodeController', () => {
  let controller: ConfirmationCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmationCodeController],
    }).compile();

    controller = module.get<ConfirmationCodeController>(ConfirmationCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
