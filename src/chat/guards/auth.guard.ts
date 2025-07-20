import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class WsJwtGuard implements CanActivate{
    private readonly logger = new Logger(WsJwtGuard.name)

    constructor(private readonly jwtService:JwtService){}
    canActivate(context: ExecutionContext): boolean  {
        const client:Socket = context.switchToWs().getClient();
        const token =this.extractToken(client)

        if (!token) {
            this.logger.error('No token provided')
            throw new WsException('No token provided')
        }
        try {
            const decoded= this.jwtService.verify(token,{
                secret:process.env.JWT_SECRET
            });
            client.data.id = decoded.sub || decoded.id; 
           this.logger.log(`Authenticated socket user: ${decoded.sub || decoded.id}`);
           return true;
        } catch (error) {
            console.log(error)
            this.logger.error(`Invalid WebSocket token: ${error.message}`);
            throw new WsException('Invalid or expired token');
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