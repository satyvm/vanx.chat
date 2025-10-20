import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  @Get()
  @ApiOkResponse({ type: ChatEntity, isArray: true })
  findAll() {
    return this.chatsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ChatEntity })
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ChatEntity })
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatsService.update(+id, updateChatDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ChatEntity })
  remove(@Param('id') id: string) {
    return this.chatsService.remove(+id);
  }
}
