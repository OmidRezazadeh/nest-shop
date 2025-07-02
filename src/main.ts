import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express'; 

import * as path from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(__dirname, '..', 'public'), { prefix: '/public' });

  app.useGlobalPipes(new ValidationPipe());
  useContainer(app.select(AppModule),{fallbackOnErrors:true});



app.setGlobalPrefix('api/v1', {
  exclude: [{ path: 'paycallback', method: RequestMethod.GET }],
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
