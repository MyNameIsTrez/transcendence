import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ChatService } from '../../chat/chat.service';
import {
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { Visibility } from 'src/chat/chat.entity';

class CreateDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(Visibility)
  visibility: Visibility;

  @ValidateIf((x) => x.visibility === Visibility.PROTECTED)
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

  // TODO: Use this here? The function using this dto will then need to make this argument optional
  // @ValidateIf((x) => x.visibility === Visibility.PROTECTED)
  @IsNotEmpty()
  password: string;
}

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  async create(@Request() req, @Body() dto: CreateDto) {
    return await this.chatService.create(
      req.user.intra_id,
      dto.name,
      dto.visibility,
      dto.password,
    );
  }

  @Post('addUserToChat')
  async AddUserToChat(@Body() dto: AddUserDto) {
    return await this.chatService.addUser(dto.chat_id, dto.username);
  }

  @Post('addAdminToChat')
  async AddAdminToChat(@Body() dto: AddUserDto) {
    return await this.chatService.addAdmin(dto.chat_id, dto.username);
  }

  @Get('kick/:chat_id/:username')
  async kick(@Param() dto: AddUserDto) {
    return await this.chatService.kickUser(dto.chat_id, dto.username);
  }

  @Get('ban/:chat_id/:username')
  async ban(@Param() dto: AddUserDto) {
    return await this.chatService.banUser(dto.chat_id, dto.username);
  }

  @Get('name/:chat_id')
  async name(@Param() dto: NameDto) {
    return await this.chatService.getName(dto.chat_id);
  }

  @Get('history/:chat_id')
  async history(@Param() dto: NameDto) {
    return await this.chatService.getHistory(dto.chat_id);
  }

  @Get('isAdmin/:chat_id/:intra_id')
  async isAdmin(@Param() dto: OtherUserDto) {
    return await this.chatService.isAdmin(dto.chat_id, dto.intra_id);
  }

  @Get('isOwner/:chat_id/:intra_id')
  async isOwner(@Param() dto: OtherUserDto) {
    return await this.chatService.isOwner(dto.chat_id, dto.intra_id);
  }

  @Post('mute')
  async mute(@Body() dto: MuteDto) {
    return await this.chatService.mute(dto.chat_id, dto.username, dto.days);
  }

  @Get('isMute/:chat_id/:intra_id')
  async isMute(@Param() dto: OtherUserDto) {
    return await this.chatService.isMute(dto.chat_id, dto.intra_id);
  }

  @Get('info/:chat_id')
  async getInfo(@Request() req, @Param() dto: NameDto) {
    return await this.chatService.getInfo(dto.chat_id, req.user.intra_id);
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
  async changePassword(@Body() dto: PasswordDto) {
    return await this.chatService.changePassword(dto.chat_id, dto.password);
  }

  @Post('changeVisibility')
  async changeVisibility(@Body() dto: ChangeVisibilityDto) {
    return await this.chatService.changeVisibility(
      dto.chat_id,
      dto.visibility,
      dto.password,
    );
  }

  @Get('publicChats')
  async getPublicChats() {
    return await this.chatService.getPublicChats();
  }

  @Get('protectedChats')
  async getProtectedChats() {
    return await this.chatService.getProtectedChats();
  }

  @Get('leave/:chat_id')
  async leave(@Request() req, @Param() dto: NameDto) {
    return await this.chatService.leave(dto.chat_id, req.user.intra_id);
  }
}
