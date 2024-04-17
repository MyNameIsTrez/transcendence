import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Request,
  StreamableFile,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { createReadStream } from 'fs';
import { IsNotEmpty } from 'class-validator';

export class SetUsernameDto {
  @IsNotEmpty()
  username: string;
}

@Controller('api/user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('username')
  username(@Request() req) {
    return this.usersService.getUsername(req.user.intra_id);
  }

  @Post('setUsername')
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
  profilePicture(@Param('id') id): StreamableFile {
    const file = createReadStream(`profile_pictures/${id}.png`, 'base64');
    return new StreamableFile(file);
  }
}
