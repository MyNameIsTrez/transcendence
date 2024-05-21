import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { existsSync, mkdirSync, writeFile } from 'fs';
import { UsersService } from '../users/users.service';
import { authenticator } from 'otplib';
import { User } from '../users/user.entity';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
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

  async login(access_token: string) {
    const requestHeaders = new Headers();
    requestHeaders.set('Authorization', `Bearer ` + access_token);
    return fetch('https://api.intra.42.fr/v2/me', {
      headers: requestHeaders,
    })
      .then((response) => response.json())
      .then(async (j) => {
        const intra_id = j.id;

        if (!(await this.usersService.hasUser(intra_id))) {
          console.log(`Saving user with intra_id ${intra_id}`);

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
            console.log('Saved profile picture');
          });
          this.usersService.create(intra_id, j.displayname, j.login, j.email);
        }

        const payload = { sub: intra_id };
        return this.jwtService.sign(payload);
      });
  }

  async generateTwoFactorAuthenticationSecret(intra_id: number, user: User) {
    console.log('In generateTwoFactorAuthenticationSecret()');
    const secret = user.twoFactorAuthenticationSecret ? user.twoFactorAuthenticationSecret : authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      intra_id.toString(),
      this.configService.get('APP_NAME'),
      secret,
    );

    await this.usersService.setTwoFactorAuthenticationSecret(
      secret,
      intra_id,
    );

    return {
      secret,
      otpAuthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    twoFactorAuthenticationSecret: string,
  ) {
    console.log('token', twoFactorAuthenticationCode);
    console.log('secret', twoFactorAuthenticationSecret);
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: twoFactorAuthenticationSecret,
    });
  }

  async loginWith2fa(intra_id: number) {
    const payload = {
      sub: intra_id,
      isTwoFactorAuthenticationEnabled: true,
      isTwoFactorAuthenticated: true,
    };

    return this.jwtService.sign(payload);
  }
}
