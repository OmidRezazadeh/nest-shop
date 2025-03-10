import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Profile } from './entities/profile';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])

],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService], // Export ProfileService so it can be used in other modules

})
export class ProfileModule {}
