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
import { IsNotEmpty } from 'class-validator';
import { writeFileSync } from 'fs';

class SetUsernameDto {
  @IsNotEmpty()
  username: string;
}

class SetIntraIdDto {
  @IsNotEmpty()
  intraId: number;
}

@Controller('api/user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('username')
  username(@Request() req) {
    return this.usersService.getUsername(req.user.intra_id);
  }

  @Get('usernameOnIntraId/:intraId')
  usernameOnIntraId(@Request() req, @Param() dto: SetIntraIdDto) {
    return this.usersService.getUsername(dto.intraId);
  }

  @Post('setUsername')
  @HttpCode(204)
  async setUsername(@Request() req, @Body() dto: SetUsernameDto) {
    await this.usersService.setUsername(req.user.intra_id, dto.username);
  }

  @Get('intraId')
  intraId(@Request() req) {
    return req.user.intra_id;
  }

  @Get('myChats')
  myChats(@Request() req) {
    return this.usersService.getMyChats(req.user.intra_id);
  }

  // @Get('allChats')
  // allChats(@Request() req) {
  //   return this.usersService.getAllChats(req.user.intra_id);
  // }

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
}
