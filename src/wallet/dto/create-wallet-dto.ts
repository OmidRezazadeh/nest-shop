
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { WalletStatus, WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  userId: number;

  @IsEnum(WalletStatus)
  status: WalletStatus;
  @IsOptional()
  @IsEnum(WalletType)
  type: WalletType;
}
