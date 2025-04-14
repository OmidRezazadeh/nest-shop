import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from '../common/constants/role-name';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/Create.Dto';
import { UpdateTagDto } from './dto/UpdateTag.Dto';




@Controller('tag')
export class TagController {
constructor(
    private readonly tagService:TagService
){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin) 
    @Post('create')
    async create(@Request() request, @Body() createTagDto: CreateTagDto) {
      return this.tagService.create(createTagDto)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin) 
    @Put('edit/:id')
    async edit(@Param('id') id: number, @Body() updateDto: UpdateTagDto) {
      await this.tagService.edit(updateDto,id)
      return {"message":"تگ  بروز رسانی"}
     
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin) 
    @Get('list')
    async listAll(@Body() body) {
      const tags = await this.tagService.findAll(body);
      return {
        data: tags,
      };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin) 
    @Get('/:id')
    async single(@Param('id') id: number) {
      const tag = await this.tagService.findById(id);
      return {
        data: tag,
      };
    }


    

  }
