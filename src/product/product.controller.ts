import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { RedisKeys } from 'src/redis/redis-keys-constants';
import { RedisService } from '../redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService:ProductService,
        // private readonly redisService:RedisService
    ){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin) 
    @Post('create')
async create(@Body() createProductDto:CreateProductDto){



    const product =  await this.productService.create(createProductDto)


        // const productCacheKey = RedisKeys.PRODUCTS_LIST;
        // await this.redisService.deleteValue(productCacheKey);     
       
        return product
}

}
