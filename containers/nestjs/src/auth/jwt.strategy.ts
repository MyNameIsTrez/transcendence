import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user: User = await this.userService.findOne(payload.sub);

    if (!user) {
      throw new BadRequestException('Failed to find user in database');
    }

    // What this function returns is what req.user will be set to everywhere
    return {
      intra_id: payload.sub,
      twoFactorAuthenticationSecret: user.twoFactorAuthenticationSecret,
    };
  }
}
