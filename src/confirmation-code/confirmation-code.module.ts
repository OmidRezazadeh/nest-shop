import { Module } from '@nestjs/common';
import { ConfirmationCodeService } from './confirmation-code.service';
import { confirmationCode } from './entities/confirmationCode';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forFeature([confirmationCode]) // Register the entity
  ],
  providers: [ConfirmationCodeService],
  exports: [ConfirmationCodeService],
})
export class ConfirmationCodeModule {
  
}
