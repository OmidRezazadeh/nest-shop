import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

import { DateModule } from 'src/date/date.module';
@Module({
  imports:[TypeOrmModule.forFeature([Transaction,User]),
  DateModule, 
 JwtModule.registerAsync({
      useFactory:()=>({
        secret:process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
      })
})

],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService], 

})
export class TransactionModule {}
