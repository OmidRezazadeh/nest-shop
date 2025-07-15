
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { WalletStatus } from 'src/common/constants/wallet-status';
import { WalletType } from 'src/common/constants/wallet-type';

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
