import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@Inject('REDIS_CLIENT') private readonly redisClint:Redis){}
    async deleteValue(key:string){
        return this.redisClint.del(key);
    }
}
