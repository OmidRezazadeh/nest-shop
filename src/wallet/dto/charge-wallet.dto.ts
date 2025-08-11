import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ChargeWalletDto {
  @ApiProperty({ example: 50000, description: 'Amount to charge in the smallest currency unit' })
  @IsInt()
  @Min(1)
  amount: number;
}


