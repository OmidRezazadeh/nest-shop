import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { LogsController } from './logs.controller';
import { JwtModule } from '@nestjs/jwt';
import { DateService } from 'src/date/date.service';


@Module({
  imports: [TypeOrmModule.forFeature([Log]),
  JwtModule.registerAsync({
    useFactory:()=>({
      secret:process.env.JWT_SECRET,
      signOptions:{expiresIn:process.env.JWT_EXPIRES_IN}
    })
  }),

],
  providers: [LogsService,DateService],
  exports: [LogsService],
  controllers: [LogsController], 
})
export class LogsModule {}
