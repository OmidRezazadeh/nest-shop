import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/tag.Dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
 constructor(
    @InjectRepository(Tag)
    private readonly tagRepository:Repository<Tag>
 ){

 }

 async create(createTagDto:CreateTagDto){
    const tag = this.tagRepository.create(createTagDto)
    return  this.tagRepository.save(tag)
    
 }
}
