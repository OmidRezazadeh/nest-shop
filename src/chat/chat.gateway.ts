import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Server } from 'http';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './guards/auth.guard';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({ namespace: 'chat' })
@Injectable()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() messageDto: MessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.id;

    try {
      const messageData = await this.chatService.saveMessageUser(userId,messageDto);
      console.log(`[Message Received] UserID: ${userId}, Message: ${messageDto.message}, Time: ${new Date().toISOString()}`);

      this.server.emit('data',messageData);
    } catch (error) {
      console.log(error);
    }
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
