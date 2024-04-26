import { Body, Controller, Get, Post, Request } from '@nestjs/common';
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
    const intra_id = req.user.intra_id;

    // TODO: Throw error if visibility isn't PUBLIC/PROTECTED/PRIVATE

    // TODO: Implement
    const hashed_password =
      visibility === 'PROTECTED' ? this.chatService.hashPassword(password) : '';

    return this.chatService.create(intra_id, {
      chat_id: uuid(),
      name: name,
      users: [intra_id],
      history: [],
      visibility: visibility,
      hashed_password: hashed_password,
      owner: intra_id,
      admins: [intra_id],
      banned: [],
      muted: [],
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
  name(@Request() req, @Body('chat_id') chat_id) {
    return this.chatService.getName(chat_id);
  }

  @Get('users')
  users(@Request() req) {
    // TODO: Access the chat db
    return [42, 69, 420];
  }

  @Get('history')
  history(@Request() req) {

    // TODO: Access the chat db
    // return [{42: 'hello'}, {69: 'world'}, {420: '!'}]

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
    return 'PUBLIC';
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
