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
  async usernameOnIntraId(@Request() req, @Param() dto: SetIntraIdDto) {
    return await this.userService.getUsername(dto.intraId);
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

  @Get('profilePicture/:intra_id.png')
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
        validators: [new FileTypeValidator({ fileType: 'image/png' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    writeFileSync(`profile_pictures/${req.user.intra_id}.png`, file.buffer);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return await this.userService.getLeaderboard();
  }

  @Get('block/:my_intra_id/:other_intra_id')
  async blockUser(@Param() dto: BlockDto) {
    return await this.userService.block(dto.my_intra_id, dto.other_intra_id);
  }

  @Get('unblock/:my_intra_id/:other_intra_id')
  async unblockUser(@Param() dto: BlockDto) {
    return await this.userService.unblock(dto.my_intra_id, dto.other_intra_id);
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
