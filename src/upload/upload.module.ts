import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],

  providers: [UploadService],
  controllers: [UploadController],
  exports:[UploadService,TypeOrmModule]
})
export class UploadModule {}
