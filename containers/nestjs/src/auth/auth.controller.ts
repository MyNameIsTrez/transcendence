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
import { UsersService } from '../users/users.service';
import { User } from 'src/users/user.entity';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Get('login')
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

  @Post('2fa/generate')
  async generate(@Response() response, @Request() request) {
    const user: User = await this.usersService.findOne(request.user.intra_id);

    if (user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException(
        "Can't regenerate QR when 2fa is already enabled",
      );
    }

    const { otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );

    return response.json(
      await this.authService.generateQrCodeDataURL(otpAuthUrl),
    );
  }

  @Post('2fa/turn-on')
  async turnOn(@Request() request, @Body() body) {
    const user: User = await this.usersService.findOne(request.user.intra_id);

    if (user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException(
        "Can't turn on 2fa when it is already enabled",
      );
    }

    console.log('body', body);
    console.log('request.user', request.user);
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      request.user.twoFactorAuthenticationSecret,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.turnOnTwoFactorAuthentication(
      request.user.intra_id,
    );
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @Public()
  @UseGuards(JwtAuthGuard)
  async authenticate(@Request() request, @Body() body) {
    if (request.user.isTwoFactorAuthenticated) {
      throw new UnauthorizedException(
        "Can't authenticate when already authenticated",
      );
    }

    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      request.user.twoFactorAuthenticationSecret,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authService.loginWith2fa(request.user.intra_id);
  }
}
