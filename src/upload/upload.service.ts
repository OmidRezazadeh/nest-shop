import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async saveFile(file: Express.Multer.File) {
    const fileName = `compressed-${Date.now()}.jpg`;
    const filePath = path.join(
      __dirname,
      '../../' + process.env.UPLOAD_DIR,
      fileName,
    );
    await sharp(file.buffer)
      .resize({ width: Number(process.env.IMAGE_WIDTH) })
      .jpeg({ quality: Number(process.env.IMAGE_QUALITY) })
      .toFile(filePath);

    return fileName;
  }
  async checkImageExists(imageName, userId) {
    const image = await this.photoRepository.findOne({
      where: { imageable_id: userId, filename: imageName },
    });
    return image;
  }

  async validateImageExist(file_name: string) {
    const imagePath = path.join(
      __dirname,
      `../../${process.env.UPLOAD_DIR}/${file_name}`,
    );

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('عکس مورد نظر یافت نشد');
    }
  }

  async moveImageProduct(file_names: any, productId: number) {
    const productFolder = path.join(
      __dirname,
      `../../${process.env.PRODUCT_DIR}/${productId}`,
    );
    for (const file_name of file_names) {
      
      if (!fs.existsSync(productFolder)) {
        fs.mkdirSync(productFolder, { recursive: true });
      }

      const imagePath = path.join(
        __dirname,
        `../../${process.env.UPLOAD_DIR}/${file_name}`,
      );
      const newFilePath = path.join(productFolder, file_name);
      fs.renameSync(imagePath, newFilePath);
    }
  }

 async moveImageEditProduct(file_name: any, productId: number)
{
  const productFolder = path.join(
    __dirname,
    `../../${process.env.PRODUCT_DIR}/${productId}`,
  );

    
    if (!fs.existsSync(productFolder)) {
      fs.mkdirSync(productFolder, { recursive: true });
    }

    const imagePath = path.join(
      __dirname,
      `../../${process.env.UPLOAD_DIR}/${file_name}`,
    );
    const newFilePath = path.join(productFolder, file_name);
    fs.renameSync(imagePath, newFilePath);
  
}
  async replaceProductImage(
    photoId: number,
    productId: number,
    fileName: string,
  ) {
    const productFileName = await this.photoRepository.findOne({
      where: {
        id: photoId,
        imageable_id: productId,
      },
      select: ['filename'],
    });

    if (!productFileName) {
      throw new NotFoundException('عکس مورد نظر یافت نشد');
    }

    const oldProductImage = path.join(
      __dirname,
      `../../${process.env.PRODUCT_DIR}/${productId}/${productFileName}`,
    );

    if (oldProductImage) {
      fs.unlinkSync(oldProductImage);
    }

    const imagePath = path.join(
      __dirname,
      `../../${process.env.UPLOAD_DIR}/${fileName}`,
    );
    const productFolder = path.join(
      __dirname,
      `../../${process.env.PRODUCT_DIR}/${productId}`,
    );
    const newFilePath = path.join(productFolder, fileName);
    fs.renameSync(imagePath, newFilePath);
  }

  async deleteProductImage(photoId: number,productId:number ,fileName: string) {

    const oldProductImage = path.join(
      __dirname,
      `../../${process.env.PRODUCT_DIR}/${productId}/${fileName}`,
    );

    

    if (oldProductImage) {
      fs.unlinkSync(oldProductImage);
    }

    await this.photoRepository.delete(
      {id: photoId,imageable_id: productId,filename:fileName}
    );
    




  }
}
