import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  useContainer(app.select(AppModule),{fallbackOnErrors:true});



  app.setGlobalPrefix('/api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
