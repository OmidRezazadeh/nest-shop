import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { QueryRunner, DataSource, Repository, IsNull } from 'typeorm';
import { Message } from './entities/Message.entity';
import { User } from 'src/user/entities/user.entity';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';
import { Conversation } from './entities/Conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerMessageDto } from './dto/answer-message.dto';
import { plainToInstance } from 'class-transformer';
import { clientMessageDto } from './dto/client-message.dto';
import { DateService } from 'src/date/date.service';
import { ChatDto } from './dto/chat.dto';
import { ConversationDto } from './dto/conversation.dto';

@Injectable()
export class ChatService {
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

    const user = await queryRunner.manager.findOne(User, {
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('کاربری یافت نشد');
    }
    try {
      let conversation = await queryRunner.manager.findOne(Conversation, {
        where: { user: { id: userId }, isClosed: false },
      });

      if (!conversation) {
        conversation = queryRunner.manager.create(Conversation, {
          user: { id: userId },
        });
        conversation = await queryRunner.manager.save(
          Conversation,
          conversation,
        );
      }
      const message = queryRunner.manager.create(Message, {
        content: messageDto.message,
        sender: user,
        conversation: { id: conversation.id },
      });

      await queryRunner.manager.save(Message, message);
      if (!conversation) {
        throw new NotFoundException(' گفتگوی یافت نشد');
      }

      const result = queryRunner.manager.findOne(Message, {
        where: { id: message.id },
        relations: [
          'conversation',
          'sender',
          'conversation.user',
          'conversation.admin',
        ],
      });
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('لطفا مجددا امتحان کنید');
    } finally {
      await queryRunner.release();
    }
  }
  formatMessageResponse(messageData: any) {
    if (!messageData) {
      throw new NotFoundException(' پیامی یافت نشد');
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
      throw new NotFoundException(' شما اجازه دسترسی به این چت را ندارید');
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
    const conversation = await this.conversationRepository.findOne({
      where: { id: answerMessageDto.conversationId },
      relations: ['user', 'admin'],
    });
    if (!conversation) {
      throw new NotFoundException('گفتگویی یافت نشد');
    }
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      conversation.admin = admin;
      await queryRunner.manager.save(Conversation, conversation);

      const message = queryRunner.manager.create(Message, {
        sender: admin,
        conversation: { id: answerMessageDto.conversationId },
        content: answerMessageDto.message,
      });
      await queryRunner.manager.save(Message, message);

      const messageData = queryRunner.manager.findOne(Message, {
        where: { id: message.id },
        relations: [
          'conversation',
          'conversation.user',
          'sender',
          'conversation.admin',
        ],
      });
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
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user', 'admin'],
    });
  }
  async getConversationWithAdmin(conversationId: number) {
    const conversation = this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['admin'],
    });
  }
}
