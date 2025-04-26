import { Module } from '@nestjs/common';
import { ProductTagService } from './product-tag.service';

@Module({
  providers: [ProductTagService]
})
export class ProductTagModule {}
