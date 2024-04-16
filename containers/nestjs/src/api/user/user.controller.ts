import {
  Controller,
  Get,
  Header,
  Param,
  Request,
  StreamableFile,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { createReadStream } from 'fs';

@Controller('api/user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('username')
  username(@Request() req) {
    return this.usersService.getUsername(req.user.intra_id);
  }

  @Get('myChats')
  myChats(@Request() req) {
    return this.usersService.getMyChats(req.user.intra_id);
  }

  @Get('profilePicture/:id.png')
  @Header('Content-Type', 'image/png')
  profilePicture(@Param('id') id): StreamableFile {
    const file = createReadStream(`profile_pictures/${id}.png`);
    return new StreamableFile(file);
  }
}
