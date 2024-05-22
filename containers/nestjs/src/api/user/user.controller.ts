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
import { UsersService } from '../../users/users.service';
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
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Request() req) {
    return this.usersService.getUser(req.user.intra_id);
  }

  @Get('other/:intra_id')
  user(@Param('intra_id') intra_id) {
    return this.usersService.getUser(intra_id);
  }

  @Post('setUsername')
  @HttpCode(204)
  async setUsername(@Request() req, @Body() dto: SetUsernameDto) {
    await this.usersService.setUsername(req.user.intra_id, dto.username);
  }

  @Get('myChats')
  myChats(@Request() req) {
    return this.usersService.getMyChats(req.user.intra_id);
  }

  @Get('profilePicture/:intra_id.png')
  @Header('Content-Type', 'image/png')
  getProfilePicture(@Param('intra_id') intra_id) {
    return this.usersService.getProfilePicture(intra_id);
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

  @Get('allUsers')
  getAllUsers() {
	return this.usersService.getAllUsers();
  }

  @Get('friends')
  getFriends(@Request() req) {
    return this.usersService.getFriends(req.user.intra_id);
  }

  @Get('incomingFriendRequests')
  getIncomingFriendRequests(@Request() req) {
    return this.usersService.getIncomingFriendRequests(req.user.intra_id);
  }

  @Post('sendFriendRequest')
  sendFriendRequest(@Request() req, @Body() body) {
    return this.usersService.sendFriendRequest(
      req.user.intra_id,
      body.intra_name,
    );
  }

  @Post('acceptFriendRequest')
  acceptFriendRequest(@Request() req, @Body() body) {
    this.usersService.acceptFriendRequest(req.user.intra_id, body.sender_id);
  }

  @Post('declineFriendRequest')
  declineFriendRequest(@Request() req, @Body() body) {
    this.usersService.declineFriendRequest(req.user.intra_id, body.sender_id);
  }

  @Post('removeFriend')
  removeFriend(@Request() req, @Body() body) {
    this.usersService.removeFriend(req.user.intra_id, body.friend_id);
  }
}
