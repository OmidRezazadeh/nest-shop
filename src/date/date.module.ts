// src/date/date.module.ts
import { Module } from '@nestjs/common';
import { DateService } from './date.service';

@Module({
  providers: [DateService],
  exports: [DateService], 
})
export class DateModule {}
