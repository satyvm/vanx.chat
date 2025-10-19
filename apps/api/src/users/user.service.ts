import { BaseService } from 'src/base/base.service';
import { PrismaClient, User } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(protected prisma: PrismaClient) {
    super(prisma, 'user');
  }

  async create(data: User | User[]) {
    return super.create(data);
  }

  async update(id: string, data: User) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return super.update(id, data);
  }

  async getAll(page: number, limit: number) {
    return super.findAll(page, limit);
  }

  async delete(id: string) {
    return super.delete(id);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
