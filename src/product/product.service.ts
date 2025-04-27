import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { DataSource, Repository, QueryRunner, ILike, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
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

  async create(createProductDto: CreateProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { tag_ideas, file_names } = createProductDto;

      const product = queryRunner.manager.create(Product, createProductDto);
      const savedProduct = await queryRunner.manager.save(product);

      if (tag_ideas && tag_ideas.length > 0) {
        const tagRepository = queryRunner.manager.getRepository(Tag); // اصلاح شد
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

  async list(page: number = 1, limit: number = 10) {
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
  page: number = 1,
  limit: number = 10
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
}
