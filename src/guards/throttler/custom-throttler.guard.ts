import { ThrottlerGuard } from '@nestjs/throttler';
import {  Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async throwThrottlingException() {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: ' درخواست ها بیش از حد مجاز میباشد یک دقیقه بعد امتحان کنید',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
