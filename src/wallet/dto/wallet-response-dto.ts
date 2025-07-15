import { Expose } from 'class-transformer';

export class walletResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: number;
  @Expose()
  type: number;
  @Expose()
  created_at: Date;
}
