// src/users/entities/user.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@vanx/database';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string | null;

  @ApiProperty({ required: false, nullable: true })
  emailVerifiedAt: Date | null;
}
