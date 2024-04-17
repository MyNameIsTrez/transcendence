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
  getProfilePicture(@Param('id') id): StreamableFile {
    const file = createReadStream(`profile_pictures/${id}.png`, 'base64');
    return new StreamableFile(file);
  }

  @Post('profilePicture')
  @UseInterceptors(FileInterceptor('file'))
  setProfilePicture(@Request() req, @UploadedFile() file: Express.Multer.File) {
    writeFileSync(`profile_pictures/${req.user.intra_id}.png`, file.buffer);
  }
}
