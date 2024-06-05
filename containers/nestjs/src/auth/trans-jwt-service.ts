import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export default class TransJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(
    intra_id: number,
    isTwoFactorAuthenticationEnabled: boolean,
    isTwoFactorAuthenticated: boolean,
  ) {
    return this.jwtService.sign({
      sub: intra_id,
      isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated,
    });
  }

  verify(jwt: string) {
    return this.jwtService.verify(jwt);
  }
}
