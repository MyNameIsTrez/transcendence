import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ChatService } from '../../chat/chat.service';
import { IsInt, IsEnum, IsNotEmpty, IsUUID, IsPositive } from 'class-validator';
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

class MuteDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  username: string;

  @IsInt()
  @IsPositive()
  days: number;
}

class PasswordDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  intra_id: number;
}

class ChangeVisibilityDto {
  @IsUUID()
  chat_id: string;

  @IsEnum(Visibility)
  visibility: Visibility;

  @IsNotEmpty()
  password: string;
}

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  async create(@Request() req, @Body() dto: CreateDto) {
    return this.chatService.create(
      req.user.intra_id,
      dto.name,
      dto.visibility,
      dto.password,
    );
  }

  @Post('addUserToChat')
  AddUserToChat(@Body() dto: AddUserDto) {
    return this.chatService.addUser(dto.chat_id, dto.username);
  }

  @Post('addAdminToChat')
  AddAdminToChat(@Body() dto: AddUserDto) {
    return this.chatService.addAdmin(dto.chat_id, dto.username);
  }

  @Get('kick/:chat_id/:username')
  kick(@Param() dto: AddUserDto) {
    return this.chatService.kickUser(dto.chat_id, dto.username);
  }

  @Get('ban/:chat_id/:username')
  ban(@Param() dto: AddUserDto) {
    return this.chatService.banUser(dto.chat_id, dto.username);
  }

  @Get('name/:chat_id')
  name(@Param() dto: NameDto) {
    return this.chatService.getName(dto.chat_id);
  }

  @Get('history/:chat_id')
  history(@Param() dto: NameDto) {
    return this.chatService.getHistory(dto.chat_id);
  }

  @Get('isAdmin/:chat_id/:intra_id')
  isAdmin(@Param() dto: OtherUserDto) {
    return this.chatService.isAdmin(dto.chat_id, dto.intra_id);
  }

  @Get('isOwner/:chat_id/:intra_id')
  isOwner(@Param() dto: OtherUserDto) {
    return this.chatService.isOwner(dto.chat_id, dto.intra_id);
  }

  @Get('isDirect/:chat_id')
  isDirect(@Param() dto: NameDto) {
    return this.chatService.isDirect(dto.chat_id);
  }

  @Get('getOtherIntraId/:chat_id/:intra_id')
  getOtherIntraId(@Param() dto: OtherUserDto) {
    return this.chatService.getOtherIntraId(dto.chat_id, dto.intra_id);
  }

  @Post('mute')
  async mute(@Body() dto: MuteDto) {
    return await this.chatService.mute(dto.chat_id, dto.username, dto.days);
  }

  @Get('isMute/:chat_id/:intra_id')
  async isMute(@Param() dto: OtherUserDto) {
    return await this.chatService.isMute(dto.chat_id, dto.intra_id);
  }

  @Get('info/:chat_id/:intra_id')
  async getInfo(@Param() dto: OtherUserDto) {
    return await this.chatService.getInfo(dto.chat_id, dto.intra_id);
  }

  @Get('isLocked/:chat_id/:intra_id')
  async isLocked(@Param() dto: OtherUserDto) {
    return await this.chatService.isLocked(dto.chat_id, dto.intra_id);
  }

  @Get('validatePassword/:chat_id/:password/:intra_id')
  async isPassword(@Param() dto: PasswordDto) {
    return await this.chatService.isPassword(
      dto.chat_id,
      dto.password,
      dto.intra_id,
    );
  }

  @Post('changePassword')
  changePassword(@Body() dto: PasswordDto) {
    return this.chatService.changePassword(dto.chat_id, dto.password);
  }

  @Post('changeVisibility')
  changeVisibility(@Body() dto: ChangeVisibilityDto) {
    return this.chatService.changeVisibility(
      dto.chat_id,
      dto.visibility,
      dto.password,
    );
  }

  @Get('channels')
  channels() {
    return this.chatService.channels();
  }
}
