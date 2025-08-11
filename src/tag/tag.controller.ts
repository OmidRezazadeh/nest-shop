import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE_NAME } from '../common/constants/role-name';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/CreateTag.Dto';
import { UpdateTagDto } from './dto/UpdateTag.Dto';
import { ListTagsDto } from './dto/ListTags.Dto';




@ApiTags('Tag')
@ApiBearerAuth()
@Controller('tag')
export class TagController {
constructor(
    private readonly tagService:TagService
){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin)
    @Post('create')
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiCreatedResponse({ description: 'Tag created successfully' })
    async create(@Request() request, @Body() createTagDto: CreateTagDto) {
      return this.tagService.create(createTagDto)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin)
    @Put('edit/:id')
    @ApiOperation({ summary: 'Edit an existing tag' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Tag updated successfully' })
    async edit(@Param('id') id: number, @Body() updateDto: UpdateTagDto) {
      await this.tagService.edit(updateDto,id)
      return {"message":"تگ  بروز رسانی"}
     
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin)
    @Get('list')
    @ApiOperation({ summary: 'List tags with pagination and filters' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiOkResponse({ description: 'List of tags returned successfully' })
    async listAll(@Query() query: ListTagsDto) {
      const tags = await this.tagService.findAll(query);
      return {
        data: tags,
      };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin)
    @Get('/:id')
    @ApiOperation({ summary: 'Get a tag by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Single tag returned successfully' })
    async single(@Param('id') id: number) {
      const tag = await this.tagService.findById(id);
      return {
        data: tag,
      };
    }


    

  }
