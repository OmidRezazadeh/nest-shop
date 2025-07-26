import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      this.logger.error('توکن ارائه نشده است');
      throw new WsException('برای اتصال باید وارد حساب کاربری شوید');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.id = decoded.sub || decoded.id;
      this.logger.log(`کاربر با شناسه ${decoded.sub || decoded.id} با موفقیت احراز هویت شد`);
      return true;
    } catch (error) {
      this.logger.error(`توکن نامعتبر یا منقضی شده است: ${error.message}`);
      throw new WsException('دسترسی نامعتبر است، لطفاً دوباره وارد شوید');
    }
  }

  private extractToken(client: Socket): string | null {
    const tokenFromQuery = client.handshake.query['Authorization'];
    const tokenFromHeaders = client.handshake.headers['authorization'];

    const token = Array.isArray(tokenFromQuery)
      ? tokenFromQuery[0]?.split(BEARER_PREFIX)[1]
      : tokenFromQuery?.split(BEARER_PREFIX)[1] ||
        tokenFromHeaders?.split(BEARER_PREFIX)[1];

    return token || null;
  }
}
