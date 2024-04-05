import { Controller, Get, Request } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('username')
  username(@Request() req) {
    const intra_id = req.user.intra_id;
    return this.usersService.getUsername(intra_id);
  }
}
