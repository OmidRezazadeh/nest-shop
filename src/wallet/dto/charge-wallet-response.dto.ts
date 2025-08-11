import { ApiProperty } from '@nestjs/swagger';

export class ChargeWalletResponseDto {
  @ApiProperty({ example: 'https://payment-gateway.example/redirect/abc123' })
  url: string;
}


