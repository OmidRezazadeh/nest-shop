import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}
    async setValue(key: string, value: string): Promise<string> {
        return this.redisClient.set(key, value, 'EX', parseInt(process.env.REDIS_DEFAULT_TTL || '300'));
    }
    
    async getValue(key: string): Promise<string | null> {
        return this.redisClient.get(key);
      }
    
      async deleteValue(key: string): Promise<number> {
        return this.redisClient.del(key);
      }

}