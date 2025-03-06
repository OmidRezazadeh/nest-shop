import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) {}


    async store(){
            const roleNames=['admin','client']
            const roles= roleNames.map(
                name=> this.roleRepository.create(
                    {name}
                ));
                return this.roleRepository.save(roles);
    }
}
