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
} from './chat.dto';

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

  // TODO: Add `:chat_id/me`
  @Get(':chat_id/me')
  public async myInfo(@Request() req, @Param() chatIdDto: ChatIdDto) {
    return await this.chatService.myInfo(chatIdDto.chat_id, req.user.intra_id);
  }

  // TODO: change to `:chat_id/addAdmin
  @Post('addAdminToChat')
  public async addAdminToChat(@Request() req, @Body() dto: AddUserDto) {
    return await this.chatService.addAdmin(dto.chat_id, req.user.intra_id);
  }

  // TODO: Change to `:chat_id/ban
  // TODO: Change this to @Post(), and get rid of :username
  @Get('ban/:chat_id/:username')
  public async ban(@Request() req, @Param() dto: AddUserDto) {
    return await this.chatService.banUser(dto.chat_id, req.user.intra_id);
  }

  // TODO: Change to `:chat_id/kick`
  // TODO: Change this to @Post(), and get rid of :username
  @Get('kick/:chat_id/:username')
  public async kick(@Request() req, @Param() dto: AddUserDto) {
    return await this.chatService.kickUser(dto.chat_id, req.user.intra_id);
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

  // TODO: Replace with commented entrypoint below?
  // TODO: Change to `:chat_id/mute`
  @Post('mute')
  public async mute(@Body() dto: MuteDto) {
    return await this.chatService.mute(dto.chat_id, dto.intra_id, dto.days);
  }

  // TODO: Change to `:chat_id/mute
  // TODO: Make sure only admin+ people are allowed to call this
  //   @Post('mute/:chat_id/:intra_id')
  //   public async mute(@Request() req, @Param() // TODO: Finish function definition)

  // TODO: Replace with `:chat_id/me`
  // TODO: Change to `:chat_id/isMute`
  // TODO: Preferably only allow if user is in the chat but not that important
  @Get('isMute/:chat_id/:intra_id')
  public async isMute(@Param() dto: OtherUserDto) {
    return await this.chatService.isMuted(dto.chat_id, dto.intra_id);
  }

  // TODO: Change to `:chat_id/patch`? or `:chat_id/edit`
  @Post('changePassword')
  public async changePassword(@Body() dto: PasswordDto) {
    return await this.chatService.changePassword(dto.chat_id, dto.password);
  }

  // TODO: Change to `:chat_id/patch`? or `:chat_id/edit`
  @Post('changeVisibility')
  public async changeVisibility(@Body() dto: ChangeVisibilityDto) {
    return await this.chatService.changeVisibility(
      dto.chat_id,
      dto.visibility,
      dto.password,
    );
  }

  // TODO: Change to `:chat_id/patch`? or `:chat_id/edit`
  // TODO: Implement functionality
  // TODO: Only allow owner to call this
  @Post('edit/:chat_id')
  public async edit(@Request() requestAnimationFrame) {}

  // TODO: Change to `:chat_id/leave`
  @Post(':chat_id/leave')
  public async leave(@Request() req, @Param() dto: NameDto) {
    return await this.chatService.leave(dto.chat_id, req.user.intra_id);
  }
}
