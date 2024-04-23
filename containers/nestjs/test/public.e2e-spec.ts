import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

require('leaked-handles'); // TODO: Remove?

describe('App (e2e)', () => {
  let app: INestApplication;
  let bearer_value: string;

  beforeEach(async () => {
    // Prevents the LobbyManager's infinite setInterval() loop from hanging our tests
    jest.useFakeTimers({ legacyFakeTimers: true });

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalGuards(new JwtAuthGuard(new Reflector()));

    const bearer_token = app.get(ConfigService).get('TEST_BEARER_TOKEN');
    console.log('bearer_token', bearer_token);
    bearer_value = 'Bearer ' + bearer_token;

    await app.init();
  });

  it('/api/public/leaderboard (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/public/leaderboard')
      .expect(200)
      .expect({ sander: 42, victor: 69 });
  });

  it('/api/chat/create (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Authorization', bearer_value)
      .set('Content-Type', 'application/json')
      .expect(201)
      .then((res) =>
        expect(res.body).toMatchObject({
          chat_id: expect.any(String),
          name: 'foo',
          users: [76657],
          history: [],
          visibility: 'PUBLIC',
          hashed_password: '',
          owner: 76657,
          admins: [76657],
          banned: [],
          muted: [],
        }),
      );
  });

  afterEach(async () => {
    jest.useRealTimers();
    await app.close();
  });
});
