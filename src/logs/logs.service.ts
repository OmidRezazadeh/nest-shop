
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { paginate } from 'src/utils/pagination';
import { plainToInstance } from 'class-transformer';
import { LogResponseDto } from './dto/logs-response.dto';
import { DateService } from 'src/date/date.service';
import { ListLogDto } from './dto/list-log.dto';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name)
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly dateService: DateService,
  ) {}

  async log(message: string, context?: string) {
    this.logger.log(message, context);
    // Logs the message to the console

    await this.saveLog('log', message, context);
    // Persists the log in the database
  }

  async error(message: string, stack?: string, context?: string) {
    this.logger.error(message, stack, context);
    // Logs error with stack trace to the console

    await this.saveLog('error', message, context, stack);
    // Persists the error in the database
  }

  async warn(message: string, context?: string) {
    this.logger.warn(message, context);
    // Logs warning to the console

    await this.saveLog('warn', message, context);
    // Persists the warning in the database
  }
  private async saveLog(
    level: string,
    message: string,
    context?: string,
    stack?: string,
  ) {
    const log = this.logRepository.create({ level, message, context, stack });
    // Creates a new log entity from the parameters

    await this.logRepository.save(log);
    // Saves the entity in the database
  }
  async list(logDto: ListLogDto) {
    const page = Number(logDto.page) || 1;
    let limit = Number(logDto.limit) || 10;
    let MAX_LIMIT = Number(process.env.MAX_LIMIT) || 100;
    limit = Math.min(limit, MAX_LIMIT);
    // Handles pagination and enforces maximum limit

    const skip = (page - 1) * limit;

    const where: any = {};
    // Where clause for filters

    if (logDto.level) {
      where.level = ILike(`%${logDto.level}%`);
      // Adds level filtering with case-insensitive partial match
    }

    if (logDto.context) {
      where.context = ILike(`%${logDto.context}%`);
      // Adds context filtering
    }

    const [logs, total] = await this.logRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
    });
    // Fetches filtered and paginated logs with total count

    const logResponse = logs.map(log => {
      const logDto = plainToInstance(LogResponseDto, log, {
        excludeExtraneousValues: true,
      });
      // Converts entity to DTO with only exposed fields

      return {
        ...logDto,
        created_at: this.dateService.convertToJalali(log.created_at),
        // Adds Jalali-formatted created_at date
      };
    });

    return {
      data: logResponse,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      // Final paginated response
    };
  }
}


