import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChatEntity } from './entities/chat.entity';

@Controller('chats')
@ApiTags('Chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiCreatedResponse({ type: ChatEntity })
  async create(@Body() createChatDto: CreateChatDto) {
    return new ChatEntity(await this.chatsService.create(createChatDto));
  }

  @Get()
  @ApiOkResponse({ type: ChatEntity, isArray: true })
  async findAll() {
    const chats = await this.chatsService.findAll();
    return chats.map((chat) => new ChatEntity(chat));
  }

  @Get(':id')
  @ApiOkResponse({ type: ChatEntity })
  async findOne(@Param('id') id: string) {
    const chat = await this.chatsService.findOne(+id);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return new ChatEntity(chat);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ChatEntity })
  async update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return new ChatEntity(await this.chatsService.update(+id, updateChatDto));
  }

  @Delete(':id')
  @ApiOkResponse({ type: ChatEntity })
  async remove(@Param('id') id: string) {
    const chat = await this.chatsService.remove(+id);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return new ChatEntity(chat);
  }
}
