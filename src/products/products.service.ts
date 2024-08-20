import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = await this.product.create({
        data: createProductDto
      });

      return product;
    } catch (error) {
      this.handleDBError(error);
    }
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
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true }
    });

    if (!product) {
      throw new RpcException({
        message: `Product #${id} not found`,
        status: HttpStatus.NOT_FOUND
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    if (Object.keys(data).length === 0) {
      throw new RpcException({
        message: 'No data provided',
        status: HttpStatus.BAD_REQUEST
      });
    }

    try {
      const updatedProduct = await this.product.update({
        where: { id },
        data
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
        throw new RpcException({
          message: 'Invalid data provided',
          status: HttpStatus.BAD_REQUEST
        });
      }
    }

    console.log(error);
    throw new RpcException({
      message: 'Internal server error',
      status: HttpStatus.INTERNAL_SERVER_ERROR
    });
  }
}
