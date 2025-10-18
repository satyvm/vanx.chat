import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BaseController } from 'src/base/base.controller';
import type { User } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends BaseController<User> {
  constructor(private userService: UserService) {
    super(userService);
  }

  @Post()
  async create(@Body() entity: User): Promise<User> {
    return await this.userService.create(entity);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() entity: User) {
    return await this.userService.update(id, entity);
  }

  @Get(':id')
  async getOneById(@Param('id') id: string) {
    return await super.getOneById(id);
  }

  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe()) page?: number,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe())
    limit?: number,
  ) {
    return await super.getAll(page, limit);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
