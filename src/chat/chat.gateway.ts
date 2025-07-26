import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';

import { Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './guards/auth.guard';
import { MessageDto } from './dto/message.dto';
import { AnswerMessageDto } from './dto/answer-message.dto';
import { AdminRolesGuard } from './guards/adminRole.guard';
import { ChatDto } from './dto/chat.dto';
import { WsAllExceptionsFilter } from './ws-exception/ws-exception.filter';

@WebSocketGateway({ namespace: 'chat' })
@UseFilters(new WsAllExceptionsFilter())
@Injectable()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}
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
      const formattedMessage = this.chatService.formatMessageResponse(messageData);
      const conversationId = messageData?.conversation.id;
      client.join(`conversation_${conversationId}`);
      this.server
        .to(`conversation_${conversationId}`)
        .emit('answerMessage', formattedMessage);
      } catch (error) {
        this.logger.error('Error in handleAnswerConversation:', error.message);
        client.emit('error', { message: error.message });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getChat')
  async handleGetChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatDto: ChatDto,
  ) {
    const userId = client.data.id;
    const conversation = await this.chatService.conversationById(chatDto, userId);
  
    
    client.join(`conversation_${chatDto.conversationId}`);


    client.emit('conversation', conversation);
  }

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
      this.logger.log(`Message received: ${messageDto.message} by user ${userId}`);


        const formattedMessage = this.chatService.formatMessageResponse(messageData);
        client.join(`conversation_${messageData?.conversation.id}`);
      this.server
        .to(`conversation_${messageData?.conversation.id}`)
        .emit('message', formattedMessage);
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


  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
