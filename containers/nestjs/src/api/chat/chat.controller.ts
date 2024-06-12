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
  intra_id: number;

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

  @ValidateIf((x) => x.visibility === Visibility.PROTECTED)
  @IsNotEmpty()
  password: string | null;
}

@Controller('api/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  public async getChats() {
    return await this.chatService.getPublicAndProtectedChats();
  }

  @Post('create')
  public async create(@Request() req, @Body() dto: CreateDto) {
    return await this.chatService.create(
      req.user.intra_id,
      dto.name,
      dto.visibility,
      dto.password,
    );
  }

  @Post('addAdminToChat')
  public async addAdminToChat(@Request() req, @Body() dto: AddUserDto) {
    return await this.chatService.addAdmin(dto.chat_id, req.user.intra_id);
  }

  // TODO: Change this to @Post(), and get rid of :username
  @Get('ban/:chat_id/:username')
  public async ban(@Request() req, @Param() dto: AddUserDto) {
    return await this.chatService.banUser(dto.chat_id, req.user.intra_id);
  }

  // TODO: Change this to @Post(), and get rid of :username
  @Get('kick/:chat_id/:username')
  public async kick(@Request() req, @Param() dto: AddUserDto) {
    return await this.chatService.kickUser(dto.chat_id, req.user.intra_id);
  }

  @Get('name/:chat_id')
  public async name(@Param() dto: NameDto) {
    return await this.chatService.getName(dto.chat_id);
  }

  @Get('history/:chat_id')
  public async history(@Param() dto: NameDto) {
    return await this.chatService.getHistory(dto.chat_id);
  }

  @Get('isAdmin/:chat_id/:intra_id')
  public async isAdmin(@Param() dto: OtherUserDto) {
    return await this.chatService.isAdmin(dto.chat_id, dto.intra_id);
  }

  @Get('isOwner/:chat_id/:intra_id')
  public async isOwner(@Param() dto: OtherUserDto) {
    return await this.chatService.isOwner(dto.chat_id, dto.intra_id);
  }

  @Post('mute')
  public async mute(@Body() dto: MuteDto) {
    return await this.chatService.mute(dto.chat_id, dto.intra_id, dto.days);
  }

  @Get('isMute/:chat_id/:intra_id')
  public async isMute(@Param() dto: OtherUserDto) {
    return await this.chatService.isMute(dto.chat_id, dto.intra_id);
  }

  @Get('info/:chat_id')
  public async getInfo(@Request() req, @Param() dto: NameDto) {
    return await this.chatService.getInfo(dto.chat_id, req.user.intra_id);
  }

  @Post('changePassword')
  public async changePassword(@Body() dto: PasswordDto) {
    return await this.chatService.changePassword(dto.chat_id, dto.password);
  }

  @Post('changeVisibility')
  public async changeVisibility(@Body() dto: ChangeVisibilityDto) {
    return await this.chatService.changeVisibility(
      dto.chat_id,
      dto.visibility,
      dto.password,
    );
  }

  @Get('leave/:chat_id')
  public async leave(@Request() req, @Param() dto: NameDto) {
    return await this.chatService.leave(dto.chat_id, req.user.intra_id);
  }
}
