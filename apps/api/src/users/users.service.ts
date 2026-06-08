import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { Prisma } from '@vanx/database';
import { prismaModulePromise } from '@vanx/database';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    createUserDto.email = this.normalizeEmail(createUserDto.email);
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;
    try {
      return await this.prisma.client.user.create({ data: createUserDto });
    } catch (error) {
      const { Prisma } = await prismaModulePromise;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.client.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.client.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.client.user.update({ where: { id }, data: updateUserDto });
  }

  async updatePassword(id: string, password: string) {
    const hashed = await bcrypt.hash(password, roundsOfHashing);
    return this.prisma.client.user.update({
      where: { id },
      data: { password: hashed },
    });
  }

  async markEmailVerified(id: string) {
    return this.prisma.client.user.update({
      where: { id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    try {
      await this.prisma.client.user.update({
        where: { id },
        data: { refreshToken },
      });
    } catch (error) {
      console.error('Failed to update refresh token:', error);
      throw new HttpException(
        'General exception',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    return this.prisma.client.user.delete({ where: { id } });
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
