import { BadRequestException, Injectable } from '@nestjs/common';
import { confirmationCode } from './entities/confirmationCode';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfirmDto } from 'src/auth/dto/confirmDto';
import { User } from 'src/user/entities/user.entity';

import { USER_STATUS } from 'src/common/constants/user-status';

@Injectable()
export class ConfirmationCodeService {
constructor(
    @InjectRepository(confirmationCode) // Correctly inject the repository
    private  confirmationCodeRepository:Repository<confirmationCode>,
    private readonly dataSource: DataSource,
){}
    async create(email:string,confirmationCode:number){
        const confirmation = await this.confirmationCodeRepository.create({email:email,code:confirmationCode});
            return await this.confirmationCodeRepository.save(confirmation);
}

async confirmEmail(confirmDto: ConfirmDto) {
    const { email, code } = confirmDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Find the confirmation code
      const confirmation = await queryRunner.manager.findOne(confirmationCode, {
        where: { email, code },
      });
  
      if (!confirmation) {
        throw new BadRequestException('کد وارد شده صحیح نیست ');
      }
  
      // Check expiration time (2 minutes)
      const currentTime = new Date();
      const createdAt = new Date(confirmation.createdAt);
      const differenceInMinutes =
        (currentTime.getTime() - createdAt.getTime()) / (1000 * 60);
  
      if (differenceInMinutes > 2) {
        throw new BadRequestException(' این کد منقضی شده ');
      }
  
      // Update user status inside the same transaction
      await queryRunner.manager.update(User, { email }, { status:USER_STATUS.ACTIVE });
  
      await queryRunner.commitTransaction();
      return { message: ' کاربر وریفای شد' };
  
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
}
