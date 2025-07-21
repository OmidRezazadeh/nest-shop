import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { QueryRunner, DataSource, Repository, IsNull } from 'typeorm';
import { Message } from './entities/Message.entity';
import { User } from 'src/user/entities/user.entity';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';
import { Conversation } from './entities/Conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Conversation)
    private conversationRepository:Repository<Conversation>,
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

      const messageData = await queryRunner.manager.save(Message, message);

      await queryRunner.commitTransaction();
      return messageData;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('لطفا مجددا امتحان کنید');
    } finally {
      await queryRunner.release();
    }
  }

  async getUserConversations() {
    
  const  convetsation=   await this.conversationRepository.find({
      where: {
        admin: IsNull(),
      },
    relations:['user','messages'],
      order: { id: 'DESC' },
    });
    console.log(convetsation);
    return convetsation
  }
}
