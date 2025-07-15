import { Expose, Type } from "class-transformer";
import { walletResponseDto } from "src/wallet/dto/wallet-response-dto";

export class transactionResponseDto{
  @Expose()
  id:number;

  @Expose()
  amount:number

  @Expose()
  status:number

  @Expose()
  ref_id: string;
  
  @Expose()
  @Type(()=>walletResponseDto)
  wallet:walletResponseDto

  
  @Expose()
  created_at:Date
  
  @Expose()
  verified_at:Date
}