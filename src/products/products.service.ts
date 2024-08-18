import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(ProductsService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({
      where: { available: true }
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      }),
      pagination: {
        page,
        limit,
        totalPages,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true }
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    if (Object.keys(updateProductDto).length === 0) {
      throw new BadRequestException('No data provided');
    }

    try {
      const updatedProduct = await this.product.update({
        where: { id },
        data: updateProductDto
      });

      return updatedProduct;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async remove(id: number) {
    try {
      const product = await this.product.update({
        where: { id, available: true },
        data: {
          available: false
        }
      });

      return product;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  handleDBError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Invalid data provided');
      }
    }

    console.log(error);
    throw new InternalServerErrorException('Check server logs for more info');
  }


}
