import {
  Controller,
  Get,
  Redirect,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('auth/login')
  @Redirect()
  async login(@Request() req) {
    const code = req.query.code;
    if (code === undefined) {
      throw new UnauthorizedException(
        'Expected an authorization code parameter from the 42 API',
      );
    }

    const access_token = await this.authService.getAccessToken(code);

    const jwt = await this.authService.login(access_token);
    return {
      url:
        process.env.VITE_ADDRESS +
        ':' +
        process.env.FRONTEND_PORT +
        `/login?jwt=${jwt}`,
      statusCode: 302,
    };
  }
}
