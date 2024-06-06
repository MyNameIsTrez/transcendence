import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Header,
  HttpCode,
  Param,
  ParseFilePipe,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from '../../user/user.service';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { writeFileSync } from 'fs';

class SetUsernameDto {
  @IsNotEmpty({
    message: 'Username should not be empty',
  })
  @MaxLength(16, {
    message: 'Name exceeds character limit of 16',
  })
  username: string;
}

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('username')
  async username(@Request() req) {
    return await this.userService.getUsername(req.user.intra_id);
  }

  @Get('intraId')
  async intraId(@Request() req) {
    return req.user.intra_id;
  }

  @Get('me')
  async me(@Request() req) {
    return await this.userService.getUser(req.user.intra_id);
  }

  @Get('other/:intra_id')
  async user(@Param('intra_id') intra_id) {
    return await this.userService.getUser(intra_id);
  }

  @Get('usernameOnIntraId/:intraId')
  async usernameOnIntraId(@Param('intraId') intraId: number) {
    return await this.userService.getUsername(intraId);
  }

  @Post('setUsername')
  @HttpCode(204)
  async setUsername(@Request() req, @Body() dto: SetUsernameDto) {
    await this.userService.setUsername(req.user.intra_id, dto.username);
  }

  @Get('chats')
  async chats(@Request() req) {
    return await this.userService.chats(req.user.intra_id);
  }

  @Get('profilePicture/:intra_id')
  @Header('Content-Type', 'image/png')
  async getProfilePicture(@Param('intra_id') intra_id) {
    return this.userService.getProfilePicture(intra_id);
  }

  @Post('profilePicture')
  @UseInterceptors(FileInterceptor('file'))
  async setProfilePicture(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /image\/.*/ })],
      }),
    )
    file: Express.Multer.File,
  ) {
    writeFileSync(`profile_pictures/${req.user.intra_id}`, file.buffer);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return await this.userService.getLeaderboard();
  }

  @Get('block/:intraId')
  async blockUser(@Request() req, @Param('intraId') intraId: number) {
    return await this.userService.block(req.user.intra_id, intraId);
  }

  @Get('unblock/:intraId')
  async unblockUser(@Request() req, @Param('intraId') intraId: number) {
    return await this.userService.unblock(req.user.intra_id, intraId);
  }

  @Get('hasBlocked/:intraId')
  async hasBlocked(@Request() req, @Param('intraId') intraId: number) {
    return await this.userService.hasBlocked(req.user.intra_id, intraId);
  }

  @Get('blocked')
  async blocked(@Request() req) {
    return await this.userService.blocked(req.user.intra_id);
  }

  @Get('friends')
  async getFriends(@Request() req) {
    return await this.userService.getFriends(req.user.intra_id);
  }

  @Get('incomingFriendRequests')
  async getIncomingFriendRequests(@Request() req) {
    return await this.userService.getIncomingFriendRequests(req.user.intra_id);
  }

  @Post('sendFriendRequest')
  async sendFriendRequest(@Request() req, @Body() body) {
    await this.userService.sendFriendRequest(
      req.user.intra_id,
      body.intra_name,
    );
  }

  @Post('acceptFriendRequest')
  async acceptFriendRequest(@Request() req, @Body() body) {
    await this.userService.acceptFriendRequest(
      req.user.intra_id,
      body.sender_id,
    );
  }

  @Post('declineFriendRequest')
  async declineFriendRequest(@Request() req, @Body() body) {
    await this.userService.declineFriendRequest(
      req.user.intra_id,
      body.sender_id,
    );
  }

  @Post('removeFriend')
  async removeFriend(@Request() req, @Body() body) {
    await this.userService.removeFriend(req.user.intra_id, body.friend_id);
  }

  @Get('matchHistory/:intra_id')
  async getMatchHistory(@Param('intra_id') intra_id) {
    return (await this.userService.getMatchHistory(intra_id)).reverse();
  }
}
