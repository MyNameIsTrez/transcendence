import { Controller, Get, Request } from '@nestjs/common';

@Controller('api/user')
export class UserController {
  @Get('username')
  username(@Request() req) {
    req;
    return 'Sander';
  }
}
