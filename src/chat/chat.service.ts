import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';

import { QueryRunner, DataSource } from 'typeorm';
import { Message } from './entities/Message.entity';
import { User } from 'src/user/entities/user.entity';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';
import { Conversation } from './entities/Conversation.entity';

@Injectable()
export class ChatService {
  constructor(private readonly dataSource: DataSource) {}
  async saveMessageUser(userId: number, messageDto: MessageDto) {
   
   const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

   const user = await queryRunner.manager.findOne(User, {
      where: { id: userId }
   });
   if (!user) {
      throw new NotFoundException('کاربری یافت نشد');
    }
    try {

    
      const conversation = await queryRunner.manager.findOne(Conversation, {
         where: { user: { id: userId }, isClosed: false },
      });
      let messageData: any;
      if (!conversation) {
        const saveConversation = queryRunner.manager.create(Conversation, {
          user: { id: userId },
        });

        await queryRunner.manager.save(Conversation, saveConversation);
        const message = queryRunner.manager.create(Message, {
          content: messageDto.message,
          sender: user,
          conversation: saveConversation,
        });

        messageData = await queryRunner.manager.save(Message,message);
      } else {

        return { message: 'ok' };
      }
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
}
