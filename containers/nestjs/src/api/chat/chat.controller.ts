import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { ChatService } from '../../chat/chat.service';
import {
  ChatIdDto,
  NameDto,
  AddUserDto,
  OtherUserDto,
  MuteDto,
  PasswordDto,
  ChangeVisibilityDto,
  IntraIdDto,
} from './chat.dto';
import { Visibility } from 'src/chat/chat.entity';

//	/api/chats GET => alle chats
//	/api/chats/:chat_id GET
//	/api/chats/:chat_id/history GET
//	/api/chats/:chat_id/history GET
//	/api/chats/:chat_id/kick {intra_id} POST
//	/api/chats/:chat_id/ban {intra_id} POST
//	/api/chats/:chat_id/patch {name?,visibility?,password?,owner_id?} POST

@Controller('api/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // TODO: Check if this is correct
  @Get()
  public async getChats() {
    return await this.chatService.getPublicAndProtectedChats();
  }

  @Get(':chat_id/me')
  public async myInfo(@Request() req, @Param() chatIdDto: ChatIdDto) {
    return await this.chatService.myInfo(chatIdDto.chat_id, req.user.intra_id);
  }

  @Get(':chat_id/users')
  public async getUsers(@Request() req, @Param() ChatIdDto: ChatIdDto) {
    return await this.chatService.getUsers(
      ChatIdDto.chat_id,
      req.user.intra_id,
    );
  }

  // TODO: change to `:chat_id/addAdmin
  @Post('addAdminToChat')
  public async addAdminToChat(@Request() req, @Body() dto: AddUserDto) {
    return await this.chatService.addAdmin(dto.chat_id, req.user.intra_id);
  }

  @Post(':chat_id/ban')
  public async ban(
    @Request() req,
    @Param() chatIdDto: ChatIdDto,
    @Body() bodyDto: IntraIdDto,
  ) {
    return await this.chatService.banUser(
      chatIdDto.chat_id,
      bodyDto.intra_id,
      req.user.intra_id,
    );
  }

  @Post(':chat_id/kick')
  public async kick(
    @Request() req,
    @Param() chatIdDto: ChatIdDto,
    @Body() bodyDto: IntraIdDto,
  ) {
    return await this.chatService.kickUser(
      chatIdDto.chat_id,
      bodyDto.intra_id,
      req.user.intra_id,
    );
  }

  // TODO: Delete probs?
  // TODO: Change to `:chat_id/name`
  // TODO: Don't allow this if the chat is private and user is not in chat preferably
  @Get('name/:chat_id')
  public async name(@Param() dto: NameDto) {
    return await this.chatService.getName(dto.chat_id);
  }
  // TODO: Change to `:chat_id/history`
  // TODO: Only allow if user is in the chat
  @Get('history/:chat_id')
  public async history(@Param() dto: NameDto) {
    return await this.chatService.getHistory(dto.chat_id);
  }

  // TODO: Change to `:chat_id/isAdmin`
  // TODO: Preferably only allow if user is in the chat but not that important
  @Get('isAdmin/:chat_id/:intra_id')
  public async isAdmin(@Param() dto: OtherUserDto) {
    return await this.chatService.isAdmin(dto.chat_id, dto.intra_id);
  }

  // TODO: Change to `:chat_id/isOwner`
  // TODO: Preferably only allow if user is in the chat but not that important
  @Get('isOwner/:chat_id/:intra_id')
  public async isOwner(@Param() dto: OtherUserDto) {
    return await this.chatService.isOwner(dto.chat_id, dto.intra_id);
  }

  @Post(':chat_id/mute')
  public async mute(
    @Request() req,
    @Param() paramDto: ChatIdDto,
    @Body() bodyDto: MuteDto,
  ) {
    return await this.chatService.mute(
      req.user.intra_id,
      paramDto.chat_id,
      bodyDto.intra_id,
      bodyDto.endDate,
    );
  }

  @Post(':chat_id/unmute')
  public async unmute(
    @Request() req,
    @Param() paramDto: ChatIdDto,
    @Body() intraIdDto: IntraIdDto,
  ) {
    return await this.chatService.unmute(
      req.user.intra_id,
      paramDto.chat_id,
      intraIdDto.intra_id,
    );
  }

  @Post(':chat_id/edit')
  public async edit(
    @Request() req,
    @Param() dto: NameDto,
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('visibility') visibility: Visibility,
  ) {
    return await this.chatService.edit(dto.chat_id, req.user.intra_id, {
      name,
      password,
      visibility,
    });
  }

  @Post(':chat_id/leave')
  public async leave(@Request() req, @Param() dto: NameDto) {
    return await this.chatService.leave(dto.chat_id, req.user.intra_id);
  }
}
