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
import { ConfigService } from '@nestjs/config';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('login')
  @Redirect()
  async login(@Request() req) {
    const code = req.query.code;

    // TODO: Add LoginDto and use it to check this for us
    if (code === undefined) {
      return {
        url:
          process.env.VITE_ADDRESS + ':' + process.env.FRONTEND_PORT + '/login',
        statusCode: 302,
      };
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
    if (!this.configService.get('VITE_ALLOW_DEBUG_USER')) {
      throw new UnauthorizedException(
        'Logging in as the debug user has been disabled',
      );
    }

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
    return await this.authService.generate(req.user.intra_id, res);
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
    return await this.authService.turnOff(
      req.user.intra_id,
      req.user.twoFactorAuthenticationSecret,
      body.twoFactorAuthenticationCode,
    );
  }

  @Get('2fa/isEnabled')
  @HttpCode(200)
  @Public()
  @UseGuards(JwtAuthGuard)
  async isEnabled(@Request() req) {
    return await this.authService.isEnabled(req.user.intra_id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @Public()
  @UseGuards(JwtAuthGuard)
  async authenticate(@Request() req, @Body() body) {
    return await this.authService.authenticate(
      req.user.intra_id,
      req.user.isTwoFactorAuthenticated,
      req.user.twoFactorAuthenticationSecret,
      body.twoFactorAuthenticationCode,
    );
  }
}
