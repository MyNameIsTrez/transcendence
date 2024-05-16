import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ChatService } from '../../chat/chat.service';
import { v4 as uuid } from 'uuid';
import { UsersService } from 'src/users/users.service';
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

class AddUserDto {
  @IsNotEmpty()
  chat_id: string;

  @IsNotEmpty()
  username: string;
}

class OtherUserDto {
  @IsNotEmpty()
  chat_id: string;

  @IsNotEmpty()
  intra_id: number;
}

class JoinDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  password: string;
}

class MuteDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  days: number;
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

    console.log("password", dto.password)

    // TODO: Implement
    const hashed_password =
      dto.visibility === Visibility.PROTECTED
        ? await this.chatService.hashPassword(dto.password)
        : '';

      console.log("hashed password", hashed_password)
  
    const current_user = await this.usersService.findOne(intra_id);
    let all_users = []
    if (dto.visibility === Visibility.PUBLIC)
      all_users = await this.usersService.getAllUsers()
    else
      all_users = [current_user]

    const num_of_users = all_users.length

    return this.chatService.create(intra_id, {
      chat_id: uuid(),
      name: dto.name,
      number_of_users: num_of_users,
      users: [...all_users],
      history: [],
      visibility: dto.visibility,
      hashed_password: hashed_password,
      owner: intra_id,
      admins: [current_user],
      banned: [],
      muted: [],
    });
  }

  @Post('addUserToChat')
  AddUserToChat(@Request() req, @Body() dto: AddUserDto) {
    console.log("addUserToChat")
    return this.chatService.addUser(dto.chat_id, dto.username);
  }

  @Post('addAdminToChat')
  AddAdminToChat(@Request() req, @Body() dto: AddUserDto) {
    console.log("addAdminToChat")
    return this.chatService.addAdmin(dto.chat_id, dto.username);
  }

  @Get('chats')
  chats(@Request() req) {
    // TODO: Access the chat db
    // Add public and protected chats, but not private ones
    return ['uuid1', 'uuid2'];
  }

  @Get('kick/:chat_id/:username')
  kick(@Request() req, @Param() dto: AddUserDto) {
    return this.chatService.kickUser(dto.chat_id, dto.username)
  }

  @Get('ban/:chat_id/:username')
  ban(@Request() req, @Param() dto: AddUserDto) {
    return this.chatService.banUser(dto.chat_id, dto.username)
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

  @Get('isAdmin/:chat_id/:intra_id')
  isAdmin(@Request() req, @Param() dto: OtherUserDto) {
    return this.chatService.isAdmin(dto.chat_id, dto.intra_id)
  }

  @Get('isOwner/:chat_id/:intra_id')
  isOwner(@Request() req, @Param() dto: OtherUserDto) {
    return this.chatService.isOwner(dto.chat_id, dto.intra_id)
  }

  @Get('isDirect/:chat_id')
  isDirect(@Request() req, @Param() dto: NameDto) {
    return this.chatService.isDirect(dto.chat_id)
  }

  @Get('visibility')
  visibility(@Request() req) {
    // TODO: Access the chat db
    return Visibility.PUBLIC;
  }

  @Get('getOtherIntraId/:chat_id/:intra_id')
  getOtherIntraId(@Request() req, @Param() dto: OtherUserDto) {
    return this.chatService.getOtherIntraId(dto.chat_id, dto.intra_id)
  }

  @Post('join')
  join(@Request() req, @Body() dto: JoinDto) {
    return this.chatService.join(req.user.intra_id, dto.chat_id, dto.password);
  }

  @Post('mute')
  async mute(@Request() req, @Body() dto: MuteDto) {
    return await this.chatService.mute(dto.chat_id, dto.username, dto.days)
  }

  @Get('isMute/:chat_id/:intra_id')
  async isMute(@Request() req, @Param() dto: OtherUserDto) {
    return await this.chatService.isMute(dto.chat_id, dto.intra_id)
  }

  @Get('info/:chat_id/:intra_id')
  async getInfo(@Request() req, @Param() dto: OtherUserDto) {
    return await this.chatService.getInfo(dto.chat_id, dto.intra_id)
  }
}
