
import { IsEnum, IsNumber } from 'class-validator';
import { WalletStatus, WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  userId: number;

  @IsEnum(WalletStatus)
  status: WalletStatus;

  @IsEnum(WalletType)
  type: WalletType;
}
