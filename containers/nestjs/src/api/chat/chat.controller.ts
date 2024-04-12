import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { Visibility } from 'src/chat/chat.entity';
import { ChatService } from 'src/chat/chat.service';
import { v4 as uuid } from 'uuid';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  create(
    @Request() req,
    @Body('name') name,
    @Body('visibility') visibility,
    @Body('password') password,
  ) {
    // TODO: Implement
    const hashed_password =
      visibility === 'PROTECTED' ? hashPassword(password) : '';

    return this.chatService.create({
      chat_id: uuid(),
      name: name,
      users: [req.user.intra_id],
      history: [],
      visibility: visibility,
      hashed_password: hashed_password,
    });
  }

  // TODO: Do we want this?
  // @Post('setName')
  // setName(@Request() req) {
  //   return this.chatService.setName();
  // }

  @Get('chats')
  chats(@Request() req) {
    // TODO: Access the chat db
    // Add public and protected chats, but not private ones
    return ['uuid1', 'uuid2'];
  }

  @Post('name')
  name(@Request() req) {
    // TODO: Use something like this
    // return this.chatService.getName(chatId);

    // TODO: Access the chat db
    return 'AwesomeChat';
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
  visibility(@Request() req): Visibility {
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
}
