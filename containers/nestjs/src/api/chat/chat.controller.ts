import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ChatService } from '../../chat/chat.service';
import {
  ChatIdDto,
  OtherUserDto,
  MuteDto,
  IntraIdDto,
  EditDto,
} from './chat.dto';

@Controller('api/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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

  @Get(':chat_id/banned_users')
  public async getBannedUsers(@Request() req, @Param() ChatIdDto: ChatIdDto) {
    return await this.chatService.getBannedUsers(
      ChatIdDto.chat_id,
      req.user.intra_id,
    );
  }

  @Post(':chat_id/admin')
  public async admin(
    @Request() req,
    @Param() paramDto: ChatIdDto,
    @Body() bodyDto: IntraIdDto,
  ) {
    return await this.chatService.addAdmin(
      paramDto.chat_id,
      req.user.intra_id,
      bodyDto.intra_id,
    );
  }

  @Post(':chat_id/unadmin')
  public async unadmin(
    @Request() req,
    @Param() paramDto: ChatIdDto,
    @Body() bodyDto: IntraIdDto,
  ) {
    return await this.chatService.removeAdmin(
      paramDto.chat_id,
      req.user.intra_id,
      bodyDto.intra_id,
    );
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

  @Post(':chat_id/unban')
  public async unban(
    @Request() req,
    @Param() chatIdDto: ChatIdDto,
    @Body() bodyDto: IntraIdDto,
  ) {
    return await this.chatService.unbanUser(
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

  // TODO: Is this endpoint used by the frontend?
  // TODO: Change to `:chat_id/name`
  @Get('name/:chat_id')
  public async name(@Param() dto: ChatIdDto) {
    return await this.chatService.getName(dto.chat_id);
  }

  // TODO: Change to `:chat_id/history`
  @Get('history/:chat_id')
  public async history(@Param() dto: ChatIdDto) {
    return await this.chatService.getHistory(dto.chat_id);
  }

  // TODO: Change to `:chat_id/isAdmin`
  @Get('isAdmin/:chat_id/:intra_id')
  public async isAdmin(@Param() dto: OtherUserDto) {
    return await this.chatService.isAdmin(dto.chat_id, dto.intra_id);
  }

  // TODO: Change to `:chat_id/isOwner`
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
    @Param() paramDto: ChatIdDto,
    @Body() dto: EditDto,
  ) {
    return await this.chatService.edit(paramDto.chat_id, req.user.intra_id, {
      name: dto.name,
      password: dto.password,
      visibility: dto.visibility,
    });
  }

  @Post(':chat_id/leave')
  public async leave(@Request() req, @Param() dto: ChatIdDto) {
    return await this.chatService.leave(dto.chat_id, req.user.intra_id);
  }
}
