import { Chat } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ChatEntity implements Chat {
  constructor(partial: Partial<ChatEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  body: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
