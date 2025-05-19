import { Controller, Get, Request, Req, UseGuards, LoggerService, Query } from '@nestjs/common';
import { request } from 'http';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { LogsService } from './logs.service';
import { ListLogDto } from './dto/list-log.dto';

@Controller('logs')
export class LogsController {

    constructor(
        private readonly logsService:LogsService
    ){}
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_NAME.Admin) 
@Get('list')
async list(@Query() logDto:ListLogDto){

   return await this.logsService.list(logDto)

}
}
