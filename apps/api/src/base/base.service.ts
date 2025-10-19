import { PrismaClient } from '@prisma/client';

export abstract class BaseService<T> {
  protected model: any;

  constructor(
    protected prisma: PrismaClient,
    modelName: keyof PrismaClient,
  ) {
    this.model = prisma[modelName];
  }

  async create(data: T | T[]): Promise<T> {
    if (Array.isArray(data)) {
      return this.model.createMany({ data });
    }
    return this.model.create({ data });
  }

  async findAll(page = 1, limit = 10): Promise<T[]> {
    const skip = (page - 1) * limit;
    return this.model.findMany({
      skip,
      take: limit,
    });
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }
}
