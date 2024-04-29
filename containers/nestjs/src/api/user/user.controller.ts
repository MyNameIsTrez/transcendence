import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Request,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from 'src/users/users.service';
import { createReadStream, writeFileSync } from 'fs';
import { IsNotEmpty } from 'class-validator';

export class SetUsernameDto {
  @IsNotEmpty()
  username: string;
}

@Controller('api/user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('username')
  getUsername(@Request() req) {
    return this.usersService.getUsername(req.user.intra_id);
  }

  @Post('username')
  setUsername(@Request() req, @Body() setUsernameDto: SetUsernameDto) {
    this.usersService.setUsername(req.user.intra_id, setUsernameDto.username);
  }

  @Get('intraId')
  intraId(@Request() req) {
    return req.user.intra_id;
  }

  @Get('myChats')
  myChats(@Request() req) {
    return this.usersService.getMyChats(req.user.intra_id);
  }

  @Get('profilePicture/:id.png')
  @Header('Content-Type', 'image/png')
  getProfilePicture(@Param('id') id): StreamableFile {
    const file = createReadStream(`profile_pictures/${id}.png`, 'base64');
    return new StreamableFile(file);
  }

  @Post('profilePicture')
  @UseInterceptors(FileInterceptor('file'))
  setProfilePicture(@Request() req, @UploadedFile() file: Express.Multer.File) {
    writeFileSync(`profile_pictures/${req.user.intra_id}.png`, file.buffer);
  }

  @Get('friends')
  getFriends(@Request() req) {
	return this.usersService.getFriends(req.user.intra_id);
  }

  @Get('incomingFriendRequests')
  getIncomingFriendRequests(@Request() req) {
	return this.usersService.getIncomingFriendRequests(req.user.intra_id);
  }

  //TODO: misschien verplaatsen
  @Post('sendFriendRequest')
  sendFriendRequest(@Request() req, @Body() body) {
	return this.usersService.sendFriendRequest(req.user.intra_id, body.intra_name);
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
