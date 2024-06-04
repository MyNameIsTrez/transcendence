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

class SetIntraIdDto {
  @IsNotEmpty()
  intraId: number;
}

class BlockDto {
  @IsNotEmpty()
  my_intra_id: number;

  @IsNotEmpty()
  other_intra_id: number;
}

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('username')
  username(@Request() req) {
    return this.userService.getUsername(req.user.intra_id);
  }

  @Get('intraId')
  intraId(@Request() req) {
    return req.user.intra_id;
  }

  @Get('me')
  me(@Request() req) {
    return this.userService.getUser(req.user.intra_id);
  }

  @Get('other/:intra_id')
  user(@Param('intra_id') intra_id) {
    return this.userService.getUser(intra_id);
  }

  @Get('usernameOnIntraId/:intraId')
  usernameOnIntraId(@Request() req, @Param() dto: SetIntraIdDto) {
    return this.userService.getUsername(dto.intraId);
  }

  @Post('setUsername')
  @HttpCode(204)
  async setUsername(@Request() req, @Body() dto: SetUsernameDto) {
    await this.userService.setUsername(req.user.intra_id, dto.username);
  }

  @Get('chats')
  chats(@Request() req) {
    return this.userService.chats(req.user.intra_id);
  }

  @Get('profilePicture/:intra_id.png')
  @Header('Content-Type', 'image/png')
  getProfilePicture(@Param('intra_id') intra_id) {
    return this.userService.getProfilePicture(intra_id);
  }

  @Post('profilePicture')
  @UseInterceptors(FileInterceptor('file'))
  setProfilePicture(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/png' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    writeFileSync(`profile_pictures/${req.user.intra_id}.png`, file.buffer);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.userService.getLeaderboard();
  }

  @Get('block/:my_intra_id/:other_intra_id')
  blockUser(@Param() dto: BlockDto) {
    return this.userService.block(dto.my_intra_id, dto.other_intra_id);
  }

  @Get('unblock/:my_intra_id/:other_intra_id')
  unblockUser(@Param() dto: BlockDto) {
    return this.userService.unblock(dto.my_intra_id, dto.other_intra_id);
  }

  @Get('blockStatus/:my_intra_id/:other_intra_id')
  async iAmBlocked(@Param() dto: BlockDto) {
    return await this.userService.iAmBlocked(
      dto.my_intra_id,
      dto.other_intra_id,
    );
  }

  @Get('friends')
  getFriends(@Request() req) {
    return this.userService.getFriends(req.user.intra_id);
  }

  @Get('incomingFriendRequests')
  getIncomingFriendRequests(@Request() req) {
    return this.userService.getIncomingFriendRequests(req.user.intra_id);
  }

  @Post('sendFriendRequest')
  sendFriendRequest(@Request() req, @Body() body) {
    return this.userService.sendFriendRequest(
      req.user.intra_id,
      body.intra_name,
    );
  }

  @Post('acceptFriendRequest')
  acceptFriendRequest(@Request() req, @Body() body) {
    this.userService.acceptFriendRequest(req.user.intra_id, body.sender_id);
  }

  @Post('declineFriendRequest')
  declineFriendRequest(@Request() req, @Body() body) {
    this.userService.declineFriendRequest(req.user.intra_id, body.sender_id);
  }

  @Post('removeFriend')
  removeFriend(@Request() req, @Body() body) {
    this.userService.removeFriend(req.user.intra_id, body.friend_id);
  }

  @Get('matchHistory/:intra_id')
  async getMatchHistory(@Param('intra_id') intra_id) {
    return (await this.userService.getMatchHistory(intra_id)).reverse();
  }
}
