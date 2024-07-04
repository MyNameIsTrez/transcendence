import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { Jwt2faAuthGuard } from './jwt-2fa-auth.guard';
import { Jwt2faStrategy } from './jwt-2fa.strategy';
import { UserModule } from '../user/user.module';
import TransJwtService from './trans-jwt-service';
import { CreationModule } from '../creation/creation.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    forwardRef(() => UserModule),
    CreationModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [
    TransJwtService,
    AuthService,
    JwtStrategy,
    Jwt2faStrategy,
    {
      provide: APP_GUARD,
      useClass: Jwt2faAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [TransJwtService],
})
export class AuthModule {}
