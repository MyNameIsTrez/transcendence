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

  afterEach(async () => {
    jest.useRealTimers();
    await app.close();
  });

  it('/api/public/leaderboard (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/public/leaderboard')
      .expect(200)
      .expect({ sander: 42, victor: 69 });
  });

  it('/api/chat/create (POST) - PUBLIC', () => {
    return api_chat_create('foo', 'PUBLIC', 'foo', '');
  });
  it('/api/chat/create (POST) - PROTECTED', () => {
    return api_chat_create('foo', 'PROTECTED', 'foo', 'foo');
  });
  it('/api/chat/create (POST) - PRIVATE', () => {
    return api_chat_create('foo', 'PRIVATE', 'foo', '');
  });
  it('/api/chat/create (POST) - empty name', () => {
    return api_chat_create('', 'PUBLIC', 'foo', '');
  });
  it('/api/chat/create (POST) - unrecognized visibility', () => {
    return api_chat_create('foo', 'foo', 'foo', '');
  });
  it('/api/chat/create (POST) - empty password', () => {
    return api_chat_create('foo', 'PUBLIC', '', '');
  });
  it('/api/chat/create (POST) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .expect(500)
      .expect({ statusCode: 500, message: 'Internal server error' });
  });

  function api_chat_create(
    name,
    visibility,
    password,
    expected_hashed_password,
  ) {
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name, visibility, password })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearer_value)
      .expect(201)
      .then((res) =>
        expect(res.body).toMatchObject({
          chat_id: expect.any(String),
          name: name,
          users: [76657],
          history: [],
          visibility: visibility,
          hashed_password: expected_hashed_password,
          owner: 76657,
          admins: [76657],
          banned: [],
          muted: [],
        }),
      );
  }

  it('/api/chat/chats (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/chat/chats')
      .set('Authorization', bearer_value)
      .expect(200)
      .expect(['uuid1', 'uuid2']);
  });
  it('/api/chat/chats (GET) - unauthorized', () => {
    return request(app.getHttpServer())
      .get('/api/chat/chats')
      .expect(500)
      .expect({ statusCode: 500, message: 'Internal server error' });
  });

  it('/api/chat/name (GET)', () => {
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearer_value)
      .expect(201)
      .then((res) => {
        return request(app.getHttpServer())
          .get('/api/chat/name/' + res.body.chat_id)
          .set('Authorization', bearer_value)
          .expect(200)
          .expect({});
      });
  });
  it('/api/chat/name (GET) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearer_value)
      .expect(201)
      .then((res) => {
        return request(app.getHttpServer())
          .get('/api/chat/name/' + res.body.chat_id)
          .expect(500)
          .expect({ statusCode: 500, message: 'Internal server error' });
      });
  });
});
