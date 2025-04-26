import { Injectable } from '@nestjs/common';
import * as moment from 'jalali-moment';

 @Injectable()
 export class DateService{

  convertToJalali(date: Date | string) {
    return moment(date).locale('fa').format('jYYYY/jMM/jDD');
}
    getCurrentJalaliDate(): string {
        return moment().locale('fa').format('jYYYY/jMM/jDD');
      }

      convertToGregorian(jalaliDate: string): string {
        // Parse the Jalali date and convert it to Gregorian
        return moment(jalaliDate, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD');
      }
 }