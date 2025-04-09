import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { CreateTagDto } from './dto/tag.Dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/role/entities/role.entity';
import { ROLE_NAME } from '../common/constants/role-name';
import { TagService } from './tag.service';

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
}
