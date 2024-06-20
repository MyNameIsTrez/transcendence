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
import { IsInt, IsNotEmpty, IsPositive, MaxLength } from 'class-validator';
import { writeFileSync } from 'fs';
import { Transform, TransformFnParams } from 'class-transformer';

class RevokeFriendDto {
  @IsInt()
  @IsPositive()
  friend_id: number;
}

class RemoveFriendDto {
  @IsInt()
  @IsPositive()
  friend_id: number;
}

class SetUsernameDto {
  @IsNotEmpty({
    message: 'Username should not be empty',
  })
  @MaxLength(16, {
    message: 'Name exceeds character limit of 16',
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  username: string;
}

class UserDto {
  @IsInt()
  @IsPositive()
  intra_id: number;
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

  @Post('setUsername')
  @HttpCode(204)
  async setUsername(@Request() req, @Body() dto: SetUsernameDto) {
    await this.userService.setUsername(req.user.intra_id, dto.username);
  }

  @Get('myChats')
  async myChats(@Request() req) {
    return await this.userService.myChats(req.user.intra_id);
  }

  @Get('profilePicture/:intra_id')
  @Header('Content-Type', 'image/png')
  async getProfilePicture(@Param('intra_id') intra_id) {
    return this.userService.getProfilePicture(intra_id);
  }

  @Post('profilePicture')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10000000 } }))
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

  @Post('block')
  async blockUser(@Request() req, @Body() dto: UserDto) {
    return await this.userService.block(req.user.intra_id, dto.intra_id);
  }

  @Post('unblock')
  async unblockUser(@Request() req, @Body() dto: UserDto) {
    return await this.userService.unblock(req.user.intra_id, dto.intra_id);
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

  @Get('outgoingFriendRequests')
  async getOutgoingFriendRequests(@Request() req) {
    return await this.userService.getOutgoingFriendRequests(req.user.intra_id);
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

  @Post('revokeFriendRequest')
  async revokeFriendRequest(@Request() req, @Body() body: RevokeFriendDto) {
    await this.userService.revokeFriendRequest(
      req.user.intra_id,
      body.friend_id,
    );
  }

  @Post('removeFriend')
  async removeFriend(@Request() req, @Body() body: RemoveFriendDto) {
    await this.userService.removeFriend(req.user.intra_id, body.friend_id);
  }

  @Get('matchHistory/:intra_id')
  async getMatchHistory(@Param('intra_id') intra_id) {
    return (await this.userService.getMatchHistory(intra_id)).reverse();
  }
}
