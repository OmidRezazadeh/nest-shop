import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTag } from 'src/product-tag/entities/product-tag.entity';
import { Photo } from 'src/upload/entities/photo.entity';
import { JwtModule } from '@nestjs/jwt';
import { UploadService } from 'src/upload/upload.service';
import { DateService } from 'src/date/date.service';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';
@Module({
  imports: [TypeOrmModule.forFeature([Product,ProductTag,Photo]),
  JwtModule.registerAsync({
    useFactory: () => ({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN 
      },
  }),
}),
],
  controllers: [ProductController],
  providers: [ProductService, UploadService,DateService,RedisService]
})
export class ProductModule {
  
}
