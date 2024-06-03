import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Redirect,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('login')
  @Redirect()
  async login(@Request() req) {
    const code = req.query.code;

    // TODO: Add LoginDto and use it to check this for us
    if (code === undefined) {
      throw new UnauthorizedException(
        'Expected an authorization code parameter from the 42 API',
      );
    }

    const { jwt, isTwoFactorAuthenticationEnabled } =
      await this.authService.login(code);

    return {
      url:
        process.env.VITE_ADDRESS +
        ':' +
        process.env.FRONTEND_PORT +
        (isTwoFactorAuthenticationEnabled ? '/twofactor' : '/login') +
        `?jwt=${jwt}`,
      statusCode: 302,
    };
  }

  @Public()
  @Get('loginFoo')
  @Redirect()
  async loginFoo() {
    return {
      url:
        process.env.VITE_ADDRESS +
        ':' +
        process.env.FRONTEND_PORT +
        `/login?jwt=${this.authService.getFooJwt()}`,
      statusCode: 302,
    };
  }

  @Post('2fa/generate')
  async generate(@Request() req, @Response() res) {
    return this.authService.generate(req.user.intra_id, res);
  }

  @Post('2fa/turn-on')
  async turnOn(@Request() req, @Body() body) {
    await this.authService.turnOn(
      req.user.intra_id,
      req.user.twoFactorAuthenticationSecret,
      body.twoFactorAuthenticationCode,
    );
  }

  @Post('2fa/turn-off')
  async turnOff(@Request() req, @Body() body) {
    return this.authService.turnOff(
      req.user.intra_id,
      req.user.twoFactorAuthenticationSecret,
      body.twoFactorAuthenticationCode,
    );
  }

  @Get('2fa/isEnabled')
  @HttpCode(200)
  @Public()
  @UseGuards(JwtAuthGuard)
  isEnabled(@Request() req) {
    return this.authService.isEnabled(req.user.intra_id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @Public()
  @UseGuards(JwtAuthGuard)
  authenticate(@Request() req, @Body() body) {
    return this.authService.authenticate(
      req.user.intra_id,
      req.user.isTwoFactorAuthenticated,
      req.user.twoFactorAuthenticationSecret,
      body.twoFactorAuthenticationCode,
    );
  }
}
