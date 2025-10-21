import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async create(createChatDto: CreateChatDto) {
    return this.prisma.chat.create({ data: createChatDto });
  }

  async findAll() {
    return this.prisma.chat.findMany();
  }

  async findOne(id: number) {
    return this.prisma.chat.findUnique({ where: { id } });
  }

  async update(id: number, updateChatDto: UpdateChatDto) {
    return this.prisma.chat.update({
      where: { id },
      data: updateChatDto,
    });
  }

  async remove(id: number) {
    return this.prisma.chat.delete({ where: { id } });
  }
}
