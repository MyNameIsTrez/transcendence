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
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/user.entity';

@Controller()
export class AuthController {
  constructor(
    private jwtService: JwtService,
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

    const jwtPayload = await this.authService.getJwtPayload(access_token);
    const jwt = this.jwtService.sign(jwtPayload);

    const user: User = await this.usersService.findOne(jwtPayload.sub);

    return {
      url:
        process.env.VITE_ADDRESS +
        ':' +
        process.env.FRONTEND_PORT +
        '/' +
        (user.isTwoFactorAuthenticationEnabled ? 'twofactor' : 'login') +
        `?jwt=${jwt}`,
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
        request.user.intra_id,
        user,
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

  @Post('2fa/turn-off')
  async turnOff(@Request() request, @Body() body) {
    const user: User = await this.usersService.findOne(request.user.intra_id);

    if (!user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException(
        "Can't turn off 2fa when it is already disabled",
      );
    }

    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      request.user.twoFactorAuthenticationSecret,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.turnOffTwoFactorAuthentication(
      request.user.intra_id,
    );
    return this.jwtService.sign({ sub: request.user.intra_id });
  }

  @Get('2fa/isEnabled')
  @HttpCode(200)
  @Public()
  @UseGuards(JwtAuthGuard)
  async isEnabled(@Request() request) {
    const user: User = await this.usersService.findOne(request.user.intra_id);

    return user.isTwoFactorAuthenticationEnabled;
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

  // TODO: Add 2fa/turn-off, which needs to set twoFactorAuthenticationSecret in the user's database to null
}

// K57XU5QKJFVFCOLC
