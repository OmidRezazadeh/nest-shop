import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';

import { Body, Injectable, Logger, Param, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './guards/auth.guard';
import { MessageDto } from './dto/message.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { AnswerMessageDto } from './dto/answer-message.dto';
import { AdminRolesGuard } from './guards/adminRole.guard';

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
      const messageData = await this.chatService.saveMessageUser(
        userId,
        messageDto,
      );
      this.logger.log(
        `Message received: ${messageDto.message} by user ${userId}`,
      );

      this.server.emit('message', messageData);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getConversations')
  async handleGetConversationList(@ConnectedSocket() client: Socket) {
    const userId = client.data.id;

    try {
      const conversations = await this.chatService.getUserConversations();
      this.server.to(`user_${userId}`).emit('conversationList', conversations);
    } catch (error) {
      console.log(error);
    }
  }



  @UseGuards(WsJwtGuard, AdminRolesGuard)
  @SubscribeMessage('answerConversation')
  async handleAnswerConversation(
    @ConnectedSocket() client: Socket,

    @MessageBody() answerMessageDto: AnswerMessageDto,
  ) {
 
    try {

      const admin = client.data;
      const messageData = await this.chatService.answerConversationById(
        answerMessageDto,
        admin,
      );
      this.server.emit('answerMessage', messageData);
   } catch (error) {
    console.error('❌ Error in handleAnswerConversation:', error);
  }
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
