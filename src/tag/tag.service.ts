import { Injectable, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { ILike, Repository } from 'typeorm';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';

import { CreateTagDto } from './dto/Create.Dto';
import { UpdateTagDto } from './dto/UpdateTag.Dto';
import { ListTagsDto } from './dto/ListTags.Dto';



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
  async findAll(query: ListTagsDto) {
    // Convert page and limit to numbers, set default values if not provided
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
  
    // Calculate how many records to skip based on the current page
    const skip = (page - 1) * limit;
  
    // Create a filter object for query conditions
    const where: any = {};
  
    // If name is provided, filter with case-insensitive partial match
    if (query.name) {
      where.name = ILike(`%${query.name}%`);
    }
  
    // If isActive is explicitly defined (true/false), add to filter
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
  
    // Retrieve data and total count of matching records from the database
    const [tags, total] = await this.tagRepository.findAndCount({
      where,             
      skip,            
      take: limit,       
      order: { id: 'DESC' }, 
    });
  
    // Calculate the total number of pages
    const totalPages = Math.ceil(total / limit);
  
    // Ensure currentPage does not exceed totalPages
    const currentPage = page > totalPages ? totalPages : page;
  
    // Set nextPage only if there is a next page
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  
    // Set prevPage only if currentPage is greater than 1
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
  
    // Return data along with pagination metadata
    return {
     // List of tags
      data: tags, 
      meta: {
        total,         
        currentPage,   
        totalPages,    
        nextPage,      
        prevPage,      
      },
    };
  }
  
  
 async findById(id:number){
   return await this.tagRepository.findOne({where:{id:id}})
 }
 
}
