import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from 'src/upload/entities/photo.entity';
import { ProductTag } from 'src/product-tag/entities/product-tag.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { In } from 'typeorm';
import { UploadService } from '../upload/upload.service';
import { plainToInstance } from 'class-transformer';
import { ProductResponseDto } from './dto/product-response.dto';
import { DateService } from '../date/date.service';
import { ListProductDto } from './dto/list-product.dto';
import { RedisService } from 'src/redis/redis.service';
import { RedisKeys } from 'src/redis/redis-keys-constants';
import { paginate } from 'src/utils/pagination';
import { EditProductDto } from './dto/edit-product.dto';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';
import { ErrorMessage } from 'src/common/errors/error-messages';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,

    @InjectRepository(ProductTag)
    private readonly productTagRepository: Repository<ProductTag>,

    private readonly dataService: DateService,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async updateQuantity(productId:number,quantity:number,queryRunner:QueryRunner){
    await queryRunner.manager.update(Product,{id:productId},{quantity:quantity})
  }
  async update(id:number, editProductDto:EditProductDto){

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { tag_ideas, photos } = editProductDto;
    try {
      
      const product = await queryRunner.manager
      .getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productTags', 'productTags')
      .leftJoinAndSelect('productTags.tag', 'tag')
      .leftJoinAndSelect('product.photos', 'photos')
      .where('product.id = :id', { id })
      .getOne();

      if (!product) {
        throw new NotFoundException("محصولی یافت نشد")
      }
      product.name = editProductDto.name ?? product.name;
      product.description = editProductDto.description ?? product.description;
      product.price = editProductDto.price ?? product.price;
      product.quantity = editProductDto.quantity ?? product.quantity;

      
      await queryRunner.manager.save(Product, product);
    
      if (tag_ideas?.map(id => Number(id))) {
      
        const tagRepository = queryRunner.manager.getRepository(Tag);
        const existingTags = await tagRepository.findBy({ id: In(tag_ideas) });

        if (existingTags.length !== tag_ideas.length) {
          throw new BadRequestException('برخی از تگ‌های انتخاب‌شده وجود ندارند.');

        }


         if(product.productTags.length == 0){

          const newProductTags = tag_ideas.map((tagId) =>
            queryRunner.manager.create(ProductTag, {
              product: product,
              tag: { id: tagId },
            }),
          );
          await queryRunner.manager.save(ProductTag, newProductTags);
        }else{

          const existingTagIds = product.productTags.map(pt => pt.tag.id);
          const tagsToRemove = existingTagIds.filter(id => !tag_ideas.includes(id));
          const tagsToAdd = tag_ideas.filter(id => !existingTagIds.includes(id));
          
       

          if (tagsToRemove.length > 0) {
            for (const tagId of tagsToRemove) {
              await queryRunner.manager.delete(ProductTag, {
                product: { id: product.id },
                tag: { id: tagId },
              });
            }
          }
          

          if (tagsToAdd.length > 0) {
            for (const tagId of tagsToAdd) {
              const productTag = queryRunner.manager.create(ProductTag, {
                product: { id: product.id },
                tag: { id: tagId },
              });
              await queryRunner.manager.save(ProductTag, productTag);
            }
          }


          }
      }
      
      if (photos && photos.length > 0) {
   
         let addNumber= 0;
         let deleteNumber = 0;
          for(const photo of photos){ 
            if (photo.action !== 'delete') {
              await this.uploadService.validateImageExist(photo.file_name);
            }
      
          
            if (photo.action === 'add') {
                 addNumber +=1
            }
            if (photo.action === 'delete') {
              deleteNumber +=1
            }
          }
         const totalNumber = addNumber - deleteNumber;

           const totalNumberPhoto = photos.length + totalNumber;
 
         if(totalNumberPhoto > 4){
          throw new BadRequestException("تعداد عکسها نباید بیشتر از چهار باشد")
          }

          for (const photo of photos) {
            if (photo.action === 'add') {

              await this.uploadService.moveImageEditProduct(photo.file_name, product.id);
              const newProduct = queryRunner.manager.create(Photo,{
                filename:photo.file_name,
                imageable_id:product.id,
                imageable_type:'product'
              })
            await queryRunner.manager.save(Photo, newProduct);
         
          }
            if (photo.action === 'replace' && photo.id) {
            
               const currentProduct =await queryRunner.manager.findOne(Photo,
                {
                    where: {
                      id: photo.id,
                      imageable_id: product.id,
                    },
                  });
              
                  if (!currentProduct) {
                    throw new NotFoundException('عکس مورد نظر یافت نشد');
                  }
            
                  const oldProductImage = path.join(
                    __dirname,
                    `../../${process.env.PRODUCT_DIR}/${product.id}/${currentProduct.filename}`,
                  );
              
                  if (fs.existsSync(oldProductImage)) {
                    fs.unlinkSync(oldProductImage);
                  } else {
                    console.warn('⚠️ فایل برای حذف پیدا نشد:', oldProductImage);
                  }
              
                  const imagePath = path.join(
                    __dirname,
                    `../../${process.env.UPLOAD_DIR}/${photo.file_name}`,
                  );
                  const productFolder = path.join(
                    __dirname,
                    `../../${process.env.PRODUCT_DIR}/${product.id}`,
                  );
                  const newFilePath = path.join(productFolder, photo.file_name);
                  fs.renameSync(imagePath, newFilePath);

                  await queryRunner.manager.update(Photo,{id:photo.id},{filename:photo.file_name})

            }

            if (photo.action === 'delete' && photo.id) {



              const oldProductImage = path.join(
                __dirname,
                `../../${process.env.PRODUCT_DIR}/${product.id}/${photo.file_name}`,
              );
          
              
          
              if (oldProductImage) {
                fs.unlinkSync(oldProductImage);
              }
          
              await this.photoRepository.delete(
                {id: photo.id,imageable_id: product.id,filename:photo.file_name}
              );
            }
    }
  }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  
   }
  async create(createProductDto: CreateProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { tag_ideas, file_names } = createProductDto;

      const product = queryRunner.manager.create(Product, createProductDto);
      const savedProduct = await queryRunner.manager.save(product);

      if (tag_ideas && tag_ideas.length > 0) {
        const tagRepository = queryRunner.manager.getRepository(Tag);
        const existingTags = await tagRepository.findBy({ id: In(tag_ideas) });

        if (existingTags.length !== tag_ideas.length) {
          throw new BadRequestException(
            'برخی از تگ‌های انتخاب‌شده وجود ندارند.',
          );
        }

        const productTags = tag_ideas.map((tagId) =>
          queryRunner.manager.create(ProductTag, {
            product: savedProduct,
            tag: { id: tagId },
          }),
        );
        await queryRunner.manager.save(ProductTag, productTags);
      }

      if (file_names && file_names.length > 0) {
       
        if(file_names.length>4){
        throw new BadRequestException(" تعداد عکسها نباید بیشتر از چهار  باشد")
        }
        for (const file_name of file_names) {
          await this.uploadService.validateImageExist(file_name);
        }

        await this.uploadService.moveImageProduct(file_names, savedProduct.id);

        const photos = file_names.map((file_name) =>
          queryRunner.manager.create(Photo, {
            filename: file_name,
            imageable_id: savedProduct.id,
            imageable_type: 'product',
          }),
        );
        await queryRunner.manager.save(Photo, photos);
      }

      const productWithRelations = await queryRunner.manager
        .getRepository(Product)
        .findOne({
          where: { id: savedProduct.id },
          relations: ['productTags', 'productTags.tag', 'photos'],
        });

      if (!productWithRelations) {
        throw new BadRequestException('محصول یافت نشد.');
      }

      const productResponse = plainToInstance(
        ProductResponseDto,
        {
          id: productWithRelations.id,
          name: productWithRelations.name,
          description: productWithRelations.description,
          price: productWithRelations.price,
          quantity: productWithRelations.quantity,
          status: productWithRelations.status,
          created_at: this.dataService.convertToJalali(
            productWithRelations.created_at,
          ),
          updated_at: this.dataService.convertToJalali(
            productWithRelations.updated_at,
          ),
          tags: productWithRelations.productTags?.map((pt) => ({
            id: pt.tag.id,
            name: pt.tag.name,
          })),
          photos: productWithRelations.photos?.map((photo) => ({
            id: photo.id,
            filename: photo.filename,
          })),
        },
        { excludeExtraneousValues: true },
      );
      await queryRunner.commitTransaction();

      return productResponse;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async list(page = 1, limit = 10) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const cacheKey = `${RedisKeys.PRODUCTS_ALL}:${page}:${limit}`;
    try {
      const cachedData = await this.redisService.getValue(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis error:', error);
    }
    const products = await this.productRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
      relations: ['productTags', 'productTags.tag', 'photos'],
    });

    try {
      await this.redisService.setValue(cacheKey, JSON.stringify(products));
    } catch (error) {
      console.error('Failed to cache products:', error);
    }

    return products;
  }



   
 async searchProducts(
  listProductDto: ListProductDto,
  page = 1,
  limit = 10
){  
    // Calculate how many records to skip based on the current page
    const skip = (page - 1) * limit;
  
    // Create a filter object for query conditions
    const   queryBuilder= this.productRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.productTags', 'productTags')
    .leftJoinAndSelect('productTags.tag', 'tag')
    .leftJoinAndSelect('product.photos', 'photos');

  if (listProductDto.name) {
    queryBuilder.andWhere('product.name ILIKE :name', { name: `%${listProductDto.name}%` });
  }
  if (listProductDto.tag) {
    queryBuilder.andWhere('tag.name ILIKE :tagName', { tagName: `%${listProductDto.tag}%` });
  }
  if (listProductDto.quantity) {
    queryBuilder.andWhere('product.quantity= :quantity',{quantity: listProductDto.quantity});
  }
  if (listProductDto.minPrice !== undefined && listProductDto.maxPrice !== undefined) {
    queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', { 
      minPrice: listProductDto.minPrice, 
      maxPrice: listProductDto.maxPrice 
    });
  }
  if (listProductDto.minPrice !== undefined) {
    queryBuilder.andWhere('product.price >= :minPrice', { minPrice: listProductDto.minPrice });
  }
  if (listProductDto.maxPrice !== undefined) {
    queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: listProductDto.maxPrice });
  } 

  const [products, total] = await queryBuilder
  .skip(skip)
  .take(limit)
  .orderBy('product.id', 'DESC')
  .getManyAndCount();

return paginate(products, total, page, limit);

 }

 async getProduct(id: number){
  const cacheKey= `${RedisKeys.PRODUCT_SINGLE}:${id}`;
  const cachedProduct = await this.redisService.getValue(cacheKey);
  if (cachedProduct) {
    return cachedProduct; 
  }

    const product=  await this.productRepository.findOne({where:{id:id},
      relations: ['productTags', 'productTags.tag', 'photos'],
    })
     if (!product) {
      throw new BadRequestException('محصول یافت نشد.');
     }
   const productResponse = plainToInstance(
      ProductResponseDto,
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        status: product.status,
        created_at: this.dataService.convertToJalali(
          product.created_at,
        ),
        updated_at: this.dataService.convertToJalali(
          product.updated_at,
        ),
        tags: product.productTags?.map((pt) => ({
          id: pt.tag.id,
          name: pt.tag.name,
        })),
        photos: product.photos?.map((photo) => ({
          id: photo.id,
          filename: photo.filename,
        })),
      },
      { excludeExtraneousValues: true },
    );

    await this.redisService.setValue(cacheKey, JSON.stringify(productResponse))
   return productResponse;
 }


}
