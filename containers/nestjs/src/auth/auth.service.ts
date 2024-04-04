import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getAccessToken(code: string): Promise<string> {
    const formData = new FormData();
    formData.set('grant_type', 'authorization_code');
    formData.set('client_id', this.configService.getOrThrow('INTRA_CLIENT_ID'));
    formData.set(
      'client_secret',
      this.configService.getOrThrow('INTRA_CLIENT_SECRET'),
    );
    formData.set('code', code);
    formData.set(
      'redirect_uri',
      this.configService.getOrThrow('VITE_ADDRESS') +
        ':' +
        this.configService.getOrThrow('BACKEND_PORT') +
        '/auth/login',
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
      .then((j) => {
        const payload = { sub: j.id };
        return this.jwtService.sign(payload);
      });
  }
}
