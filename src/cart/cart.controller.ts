import { Body, Controller, Post,Request, UseGuards } from '@nestjs/common';
import { CartDto } from './dto/create-cart.dto';
import { DataSource } from 'typeorm';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';

@Controller('cart')
export class CartController {
   constructor(


    private readonly cartService:CartService
   ){

   }

   @UseGuards(JwtAuthGuard,CheckVerifiedGuard)
   @Post('store')
   async create(@Body() cartDto:CartDto, 
   @Request() request
){
   
 

        const userId = request.user.id;
        await this.cartService.validate(cartDto)
         return await this.cartService.create(cartDto,userId)
        

   }

}
