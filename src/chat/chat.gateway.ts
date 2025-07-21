import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';

import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io'; 
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
      console.log('Socket ID:', client.id);
      this.logger.log(`Message received: ${messageDto.message} by user ${userId}`);

      this.server.emit('message',messageData);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getConversations')
  async handleGetConversationList(
    @ConnectedSocket() client: Socket,
  ){
    const userId = client.data.id;

     try {
        const conversations= await this.chatService.getUserConversations();
        this.server.to(`user_${userId}`).emit('conversationList', conversations);
     } catch (error) {
      console.log(error)
     }
  }



  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

}
