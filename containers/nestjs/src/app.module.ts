import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CreationModule } from './creation/creation.module';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_PORT: Joi.number().integer().positive(),
        POSTGRES_USER: Joi.string(),
        POSTGRES_PASSWORD: Joi.string(),
        POSTGRES_DB: Joi.string(),

        FRONTEND_PORT: Joi.number().integer().positive(),
        BACKEND_PORT: Joi.number().integer().positive(),

        VITE_ADDRESS: Joi.string().uri(),
        VITE_BACKEND_PORT: Joi.number().integer().positive(),
        VITE_INTRA_REDIRECT_URL: Joi.string().uri(),

        INTRA_CLIENT_ID: Joi.string(),
        INTRA_CLIENT_SECRET: Joi.string(),
        JWT_SECRET: Joi.string(),

        APP_NAME: Joi.string(),

        BCRYPT_SALT_ROUNDS: Joi.number().integer().positive(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
        presence: 'required',
      },
    }),
    ApiModule,
    AuthModule,
    ChatModule,
    CreationModule,
    GameModule,
    UserModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'db',
        port: parseInt(configService.get<string>('POSTGRES_PORT')),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true, // TODO: Remove, as it's unsafe in production according to the docs!
        logging: false,
        retryAttempts: 420, // The default of 10 was too low with our Docker containers
        dropSchema: false, // TODO: Set this back to false for production!!!s
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
