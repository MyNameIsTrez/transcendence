import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ChatService } from '../../chat/chat.service';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Visibility } from 'src/chat/chat.entity';

class CreateDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(Visibility)
  visibility: Visibility;

  // TODO: Only make this required if visiblity is PROTECTED
  @IsNotEmpty()
  password: string;
}

class NameDto {
  @IsUUID()
  chat_id: string;
}

class JoinDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  password: string;
}

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateDto) {
    return this.chatService.create(
      req.user.intra_id,
      dto.name,
      dto.visibility,
      dto.password,
    );
  }

  @Get('chats')
  chats(@Request() req) {
    // TODO: Access the chat db
    // Add public and protected chats, but not private ones
    return ['uuid1', 'uuid2'];
  }

  @Get('name/:chat_id')
  name(@Request() req, @Param() dto: NameDto) {
    return this.chatService.getName(dto.chat_id);
  }

  @Get('users')
  users(@Request() req) {
    // TODO: Access the chat db
    return [42, 69, 420];
  }

  @Get('history')
  history(@Request() req) {
    // TODO: Access the chat db
    return [
      {
        sender: 42,
        body: 'hello',
      },
      {
        sender: 69,
        body: 'world',
      },
      {
        sender: 420,
        body: 'lmao',
      },
    ];
  }

  @Get('visibility')
  visibility(@Request() req) {
    // TODO: Access the chat db
    return Visibility.PUBLIC;
  }

  @Get('owner')
  owner(@Request() req) {
    // TODO: Access the chat db
    return 42;
  }

  @Get('admins')
  admins(@Request() req) {
    // TODO: Access the chat db
    return [42, 69];
  }

  @Get('banned')
  banned(@Request() req) {
    // TODO: Access the chat db
    return [7, 666];
  }

  @Get('muted')
  muted(@Request() req) {
    // TODO: Access the chat db
    return [42, 69];
  }

  @Post('join')
  join(@Request() req, @Body() dto: JoinDto) {
    return this.chatService.join(req.user.intra_id, dto.chat_id, dto.password);
  }
}
