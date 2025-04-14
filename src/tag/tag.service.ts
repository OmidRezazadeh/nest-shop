import { Injectable, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { ILike, Repository } from 'typeorm';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';

import { CreateTagDto } from './dto/Create.Dto';
import { UpdateTagDto } from './dto/UpdateTag.Dto';



@Injectable()
export class TagService {
 constructor(
    @InjectRepository(Tag)
    private readonly tagRepository:Repository<Tag>
 ){

 }

 async create(createDto:CreateTagDto){
    const tag = this.tagRepository.create(createDto)
    return  this.tagRepository.save(tag)
    
 }

  async edit(updateDto:UpdateTagDto, id:number){
     const tag = await this.tagRepository.findOne({where:{id:id}});
     if (!tag) {
      throw new NotFoundException("تگ مورد نظر یافت نشد")
     }
     await this.tagRepository.update({id:id},{name:updateDto.name})
  }
  async findAll(body) {
   console.log(body.name)
   const page = body.page || 1;
   const limit = body.limit || 10;
   const skip = (page - 1) * limit;
 
   const where: any = {};
   if (body.name) {
     
     where.name = ILike(`%${body.name}%`);
   }
 
   const [data, total] = await this.tagRepository.findAndCount({
     where,
     skip,
     take: limit,
     order: { id: 'DESC' }, 
   });
 
   return {
     data,
     total,
     page,
     limit,
     totalPages: Math.ceil(total / limit),
   };
 }
 
}
