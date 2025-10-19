import { NotFoundException } from '@nestjs/common';
import { BaseService } from './base.service';

export abstract class BaseController<T> {
  protected service: BaseService<T>;
  constructor(service: BaseService<T>) {
    this.service = service;
  }

  async getOneById(id: string) {
    const result = await this.service.findById(id);
    if (!result) {
      throw new NotFoundException(`NOT_FOUND ${id}`);
    }
    return result;
  }

  async create(entity: T) {
    return this.service.create(entity);
  }

  async update(id: string, entity: T) {
    return this.service.update(id, entity);
  }

  async getAll(page?: number, limit?: number) {
    return this.service.findAll(page, limit);
  }
}
