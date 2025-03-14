import { Injectable } from '@nestjs/common';
import { confirmationCode } from './entities/confirmationCode';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ConfirmationCodeService {
constructor(
    @InjectRepository(confirmationCode) // Correctly inject the repository
    private  confirmationCodeRepository:Repository<confirmationCode>

){}
    async create(email:string,confirmationCode:number){
        const confirmation = await this.confirmationCodeRepository.create({email:email,code:confirmationCode});
            return await this.confirmationCodeRepository.save(confirmation);
}
}
