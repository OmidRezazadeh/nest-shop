// src/chat/filters/ws-exception.filter.ts

import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class WsAllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    let message = 'خطای سرور';

    if (exception instanceof ForbiddenException || exception instanceof NotFoundException) {
      message = exception.message;
    } else if (exception instanceof WsException) {
      message = exception.message;
    }

    client.emit('error', {
      status: 'error',
      message,
    });
  }
}
