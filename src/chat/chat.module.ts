import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/Conversation.entity';
import { Message } from './entities/Message.entity';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/auth.guard';
import { ChatService } from './chat.service';
import { User } from 'src/user/entities/user.entity';
import { DateService } from 'src/date/date.service';

@Module({
  imports:[TypeOrmModule.forFeature([Conversation,Message,User])],
  providers:[ChatGateway,JwtService,WsJwtGuard,ChatService,DateService],
  exports: [ChatService],
})
export class ChatModule {}
