import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { existsSync, mkdirSync, writeFile } from 'fs';
import { UsersService } from '../users/users.service';
import { authenticator } from 'otplib';
import { User } from '../users/user.entity';
import { toDataURL } from 'qrcode';
import { Chat } from 'src/chat/chat.entity';
import TransJwtService from './trans-jwt-service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private transJwtService: TransJwtService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
  ) {}

  async getAccessToken(code: string): Promise<string> {
    const formData = new FormData();

    formData.set('grant_type', 'authorization_code');
    formData.set('client_id', this.configService.get('INTRA_CLIENT_ID'));
    formData.set(
      'client_secret',
      this.configService.get('INTRA_CLIENT_SECRET'),
    );
    formData.set('code', code);
    formData.set(
      'redirect_uri',
      this.configService.get('VITE_ADDRESS') +
        ':' +
        this.configService.get('BACKEND_PORT') +
        '/login',
    );

    return fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((j) => {
        const access_token: string = j.access_token;
        if (access_token === undefined) {
          throw new UnauthorizedException(
            'Could not retrieve your 42 access token',
          );
        }
        return access_token;
      })
      .catch((err) => {
        console.error(err);
        if (err instanceof UnauthorizedException) {
          throw err;
        }
        throw new InternalServerErrorException();
      });
  }

  async login(code: string) {
    const access_token = await this.getAccessToken(code);

    const requestHeaders = new Headers();
    requestHeaders.set('Authorization', `Bearer ` + access_token);
    return fetch('https://api.intra.42.fr/v2/me', {
      headers: requestHeaders,
    })
      .then((response) => response.json())
      .then(async (j) => {
        const intra_id = j.id;

        if (!(await this.usersService.hasUser(intra_id))) {
          const url = j.image.versions.medium;

          const { data } = await firstValueFrom(
            this.httpService.get(url, {
              responseType: 'arraybuffer',
            }),
          );

          if (!existsSync('profile_pictures')) {
            mkdirSync('profile_pictures');
          }

          writeFile(`profile_pictures/${intra_id}.png`, data, (err) => {
            if (err) throw err;
          });

          await this.usersService.create(
            intra_id,
            j.displayname,
            j.login,
            j.email,
          );
        }

        const jwt = this.transJwtService.sign(intra_id, false, false); // TODO: Are the `false` correct?

        const user: User = await this.usersService.findOne(intra_id);

        return {
          jwt,
          isTwoFactorAuthenticationEnabled:
            user.isTwoFactorAuthenticationEnabled,
        };
      });
  }

  async generate(intra_id: number, response: Response) {
    const user: User = await this.usersService.findOne(intra_id);

    if (user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException(
        "Can't regenerate QR when 2fa is already enabled",
      );
    }

    const otpAuthUrl = await this.generateTwoFactorAuthenticationSecret(
      intra_id,
      user.twoFactorAuthenticationSecret,
    );

    return response.json(await toDataURL(otpAuthUrl));
  }

  async generateTwoFactorAuthenticationSecret(
    intra_id: number,
    twoFactorAuthenticationSecret: string,
  ) {
    const secret = twoFactorAuthenticationSecret
      ? twoFactorAuthenticationSecret
      : authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      intra_id.toString(),
      this.configService.get('APP_NAME'),
      secret,
    );

    await this.usersService.setTwoFactorAuthenticationSecret(secret, intra_id);

    return otpAuthUrl;
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    twoFactorAuthenticationSecret: string,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: twoFactorAuthenticationSecret,
    });
  }

  async turnOn(
    intra_id: number,
    twoFactorAuthenticationSecret: string,
    twoFactorAuthenticationCode: string,
  ) {
    const user: User = await this.usersService.findOne(intra_id);

    if (user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException(
        "Can't turn on 2fa when it is already enabled",
      );
    }

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      twoFactorAuthenticationSecret,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.turnOnTwoFactorAuthentication(intra_id);
  }

  async turnOff(
    intra_id: number,
    twoFactorAuthenticationSecret: string,
    twoFactorAuthenticationCode: string,
  ) {
    const user: User = await this.usersService.findOne(intra_id);

    if (!user.isTwoFactorAuthenticationEnabled) {
      throw new UnauthorizedException(
        "Can't turn off 2fa when it is already disabled",
      );
    }

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      twoFactorAuthenticationSecret,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.usersService.turnOffTwoFactorAuthentication(intra_id);

    return this.transJwtService.sign(intra_id, false, false); // TODO: Are the `false` correct?
  }

  async isEnabled(intra_id: number) {
    const user: User = await this.usersService.findOne(intra_id);
    return user.isTwoFactorAuthenticationEnabled;
  }

  async authenticate(
    intra_id: number,
    isTwoFactorAuthenticated: boolean,
    twoFactorAuthenticationSecret: string,
    twoFactorAuthenticationCode: string,
  ) {
    if (isTwoFactorAuthenticated) {
      throw new UnauthorizedException(
        "Can't authenticate when already authenticated",
      );
    }

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      twoFactorAuthenticationSecret,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.transJwtService.sign(intra_id, true, true);
  }
}
