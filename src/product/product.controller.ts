import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { RedisKeys } from 'src/redis/redis-keys-constants';
import { RedisService } from '../redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/Role/role/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ListProductDto } from './dto/list-product.dto';
import { EditProductDto } from './dto/edit-product.dto';
import { ProductService } from './product.service';





@Controller('product')
export class ProductController {
    constructor(
        private readonly productService:ProductService,
        private readonly redisService:RedisService
    ){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_NAME.Admin) 
    @Post('create')
    async create(@Body() createProductDto:CreateProductDto){
        const product =  await this.productService.create(createProductDto)
        const productCacheKey = RedisKeys.PRODUCTS_ALL;
        await this.redisService.deleteValue(productCacheKey);
        return product
}
  @Get('/list')
  async list(
    @Query() listProductDto:ListProductDto,
    @Param('id') id: number
  ){

     
    const page = listProductDto.page || 1;
    const limit = listProductDto.limit || 10;


    const hasSearchCriteria = 
    listProductDto.name || 
    listProductDto.description || 
    listProductDto.price || 
    listProductDto.quantity || 
    listProductDto.tag;
    if (hasSearchCriteria) {
        return this.productService.searchProducts(listProductDto, page, limit);
      }
      
      return this.productService.list(page, limit);
    
  }

  @Get('/list/:id')
  async getProduct(
    @Param('id') id: number
  ){
   return await this.productService.getProduct(id)
    
  } 




  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE_NAME.Admin) 
  @Put('/:id')
  async edit(@Body() editProductDto:EditProductDto,
  @Param('id') id: number){
   await this.productService.update(id, editProductDto);
    return {
      "message":" محصول با موفقیت  بروز رسانی شد"
    }
 
  }





}
