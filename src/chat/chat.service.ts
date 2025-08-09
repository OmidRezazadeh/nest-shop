import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { QueryRunner, DataSource, Repository, IsNull } from 'typeorm';
import { Message } from './entities/Message.entity';
import { User } from 'src/user/entities/user.entity';
import { Conversation } from './entities/Conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerMessageDto } from './dto/answer-message.dto';
import { plainToInstance } from 'class-transformer';
import { clientMessageDto } from './dto/client-message.dto';
import { DateService } from 'src/date/date.service';
import { ChatDto } from './dto/chat.dto';
import { ConversationDto } from './dto/conversation.dto';
import { ErrorMessage } from 'src/common/errors/error-messages';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private readonly dataService: DateService,
  ) {}
  async saveMessageUser(userId: number, messageDto: MessageDto) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.getUserById(queryRunner, userId);
      const conversation = await this.getOrCreateOpenConversation(
        queryRunner,
        userId,
      );

      const message = await this.createAndSaveMessage(
        queryRunner,
        user,
        conversation,
        messageDto.message,
      );

      const fullMessage = await this.getMessageWithRelations(
        queryRunner,
        message.id,
      );

      await queryRunner.commitTransaction();
      return fullMessage;
    } catch (error) {
      this.logger.error(`Message save failed: ${error.message}`, error.stack);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(ErrorMessage.GENERAL.RETRY);
    } finally {
      await queryRunner.release();
    }
  }

  private async getMessageWithRelations(
    queryRunner: QueryRunner,
    messageId: number,
  ) {
    const message = await queryRunner.manager.findOne(Message, {
      where: { id: messageId },
      relations: [
        'conversation',
        'sender',
        'conversation.user',
        'conversation.admin',
      ],
    });

    if (!message) {
      throw new NotFoundException(ErrorMessage.CHAT.NOT_FOUND);
    }

    return message;
  }

  private async createAndSaveMessage(
    queryRunner: QueryRunner,
    user: User,
    conversation: Conversation,
    content: string,
  ) {
    const message = queryRunner.manager.create(Message, {
      content,
      sender: user,
      conversation: { id: conversation.id },
    });

    return await queryRunner.manager.save(Message, message);
  }

  private async getUserById(queryRunner: QueryRunner, userId: number) {
    const user = await queryRunner.manager.findOne(User, {
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessage.USER.NOT_FOUND);
    }
    return user;
  }
  private async getOrCreateOpenConversation(
    queryRunner: QueryRunner,
    userId: number,
  ) {
    let conversation = await queryRunner.manager.findOne(Conversation, {
      where: { user: { id: userId }, isClosed: false },
    });

    if (!conversation) {
      conversation = queryRunner.manager.create(Conversation, {
        user: { id: userId },
      });
      conversation = await queryRunner.manager.save(Conversation, conversation);
    }

    return conversation;
  }
  formatMessageResponse(messageData: any) {
    if (!messageData) {
      throw new NotFoundException(ErrorMessage.CHAT.NOT_FOUND);
    }
    return plainToInstance(clientMessageDto, {
      message: messageData.content,
      id: messageData.id,
      created_at: this.dataService.convertToJalali(messageData.createdAt),
      conversation_id: messageData.conversation.id,
      user: {
        id: messageData.sender.id,
        first_name: messageData.sender.first_name,
        last_name: messageData.sender.last_name,
      },
    });
  }

  async getUserConversations() {
    return await this.conversationRepository.find({
      where: {
        admin: IsNull(),
      },
      relations: ['user', 'messages'],
      order: { id: 'DESC' },
    });
  }
  async conversationById(chatDto: ChatDto, userId: number) {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.id = :conversationId', {
        conversationId: chatDto.conversationId,
      })
      .andWhere('conversation.isClosed = false')
      .andWhere(
        '(conversation.userId = :userId OR conversation.adminId = :userId)',
        { userId },
      )
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('conversation.user', 'user')
      .leftJoinAndSelect('conversation.admin', 'admin')

      .getOne();

    if (!conversation) {
      throw new NotFoundException(ErrorMessage.CHAT.ACCESS_DENIED);
    }

    return plainToInstance(ConversationDto, {
      id: conversation.id,
      admin: conversation.admin
        ? {
            id: conversation.admin.id,
            first_name: conversation.admin.first_name,
            last_name: conversation.admin.last_name,
          }
        : null,

      user: {
        id: conversation.user.id,
        first_name: conversation.user.first_name,
        last_name: conversation.user.last_name,
      },
      messages: conversation.messages.map((message: Message) => ({
        id: message.id,
        content: message.content,
        created_at: this.dataService.convertToJalali(message.createdAt),
      })),
      created_at: this.dataService.convertToJalali(conversation.created_at),
    });
  }
  async answerConversationById(answerMessageDto: AnswerMessageDto, admin: any) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
     
      const conversation = await this.findConversationById(
        answerMessageDto.conversationId,
      );
      if (!conversation) {
        throw new NotFoundException(ErrorMessage.CHAT.CONVERSATION_NOT_FOUND);
      }

      if (!conversation.admin) {
        conversation.admin= admin;
        await queryRunner.manager.save(Conversation, conversation);
       }else if(conversation.admin.id !== admin.id ){
         throw new ForbiddenException(ErrorMessage.PERMISSION.OPERATION_FORBIDDEN)  
      }  
      const message = await this.createAndSaveMessage(
        queryRunner,
        admin,
        conversation,
        answerMessageDto.message,
      );
      const messageData = await this.getMessageWithRelations(
        queryRunner,
        message.id,
      );
      await queryRunner.commitTransaction();
      return messageData;
    } catch (error) {
      console.error('❌ Error in answerConversationById:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findConversationById(conversationId: number) {
    return await this.conversationRepository.findOne({
      where: { id: conversationId, isClosed:false },
      relations: ['user', 'admin'],
    });


  }
}
