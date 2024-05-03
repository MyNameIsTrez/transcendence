import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ChatService } from '../../chat/chat.service';
import { v4 as uuid } from 'uuid';
import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

class CreateDto {
  @IsNotEmpty()
  name: string;

  @IsIn(['PUBLIC', 'PROTECTED', 'PRIVATE'])
  visibility: string;

  // TODO: Only make this required if visiblity is PROTECTED
  @IsNotEmpty()
  password: string;
}

class NameDto {
  @IsUUID()
  chat_id: string;
}

class AddUserDto {
  @IsNotEmpty()
  chat_id: string;

  @IsNotEmpty()
  username: string;
}

@Controller('api/chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Post('create')
  async create(@Request() req, @Body() dto: CreateDto) {

    const intra_id = req.user.intra_id;

    // TODO: Throw error if visibility isn't PUBLIC/PROTECTED/PRIVATE

    // TODO: Implement
    const hashed_password =
      dto.visibility === 'PROTECTED'
        ? this.chatService.hashPassword(dto.password)
        : '';

    let all_users = []
    if (dto.visibility === 'PUBLIC')
      all_users = await this.usersService.getAllUsers()
    else
      all_users = [intra_id]

    return this.chatService.create(intra_id, {
      chat_id: uuid(),
      name: dto.name,
      users: [...all_users],
      history: [],
      visibility: dto.visibility,
      hashed_password: hashed_password,
      owner: intra_id,
      admins: [intra_id],
      banned: [],
      muted: [],
    });
  }

  @Post('addUserToChat')
  AddUserToChat(@Request() req, @Body() dto: AddUserDto) {
    console.log("addUserToChat")
    return this.chatService.addUser(dto.chat_id, dto.username);
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

  @Get('history/:chat_id')
 history(@Request() req, @Param() dto: NameDto) {
    return this.chatService.getHistory(dto.chat_id)
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
