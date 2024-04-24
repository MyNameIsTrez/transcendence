import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

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

    // Required to have class-validator check the parameter types
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // This fixes reflector not being injected into JwtAuthGuard,
    // but requires manually commenting out the global JwtAuthGuard in auth.module.ts
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

  function getPublic(path, expectedStatus, expectedBody) {
    return request(app.getHttpServer())
      .get(path)
      .expect(expectedStatus)
      .expect(expectedBody);
  }
  function postPublic(path, expectedStatus, expectedBody) {
    return request(app.getHttpServer())
      .post(path)
      .expect(expectedStatus)
      .expect(expectedBody);
  }

  function getAuthorized(path, expectedStatus, expectedBody) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', bearer_value)
      .expect(expectedStatus)
      .then((res) => expect(res.body).toStrictEqual(expectedBody));
  }
  function postAuthorized(path, sent, expectedStatus, expectedBody) {
    return request(app.getHttpServer())
      .post(path)
      .send(sent)
      .set('Content-Type', 'application/json')
      .set('Authorization', bearer_value)
      .expect(expectedStatus)
      .then((res) => expect(res.body).toStrictEqual(expectedBody));
  }

  it('/api/public/leaderboard (GET)', () => {
    return getPublic('/api/public/leaderboard', 200, {
      sander: 42,
      victor: 69,
    });
  });

  it('/api/chat/create (POST) - PUBLIC', () => {
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PUBLIC',
        password: 'foo',
      },
      201,
      {
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
      },
    );
  });
  it('/api/chat/create (POST) - PROTECTED', () => {
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PROTECTED',
        password: 'foo',
      },
      201,
      {
        chat_id: expect.any(String),
        name: 'foo',
        users: [76657],
        history: [],
        visibility: 'PROTECTED',
        hashed_password: 'foo',
        owner: 76657,
        admins: [76657],
        banned: [],
        muted: [],
      },
    );
  });
  it('/api/chat/create (POST) - PRIVATE', () => {
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PRIVATE',
        password: 'foo',
      },
      201,
      {
        chat_id: expect.any(String),
        name: 'foo',
        users: [76657],
        history: [],
        visibility: 'PRIVATE',
        hashed_password: '',
        owner: 76657,
        admins: [76657],
        banned: [],
        muted: [],
      },
    );
  });

  it('/api/chat/create (POST) - empty name', () => {
    return postAuthorized(
      '/api/chat/create',
      {
        name: '',
        visibility: 'PUBLIC',
        password: 'foo',
      },
      500,
      {
        statusCode: 500,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/create (POST) - unrecognized visibility', () => {
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'foo',
        password: 'foo',
      },
      500,
      {
        statusCode: 500,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/create (POST) - empty password', () => {
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PUBLIC',
        password: '',
      },
      500,
      {
        statusCode: 500,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/create (POST) - unauthorized', () => {
    return postPublic('/api/chat/create', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/chats (GET)', () => {
    return getAuthorized('/api/chat/chats', 200, ['uuid1', 'uuid2']);
  });
  it('/api/chat/chats (GET) - unauthorized', () => {
    return getPublic('/api/chat/chats', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/name (GET)', () => {
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearer_value)
      .expect(201)
      .then((res) => {
        return getAuthorized('/api/chat/name/' + res.body.chat_id, 200, {
          name: 'foo',
        });
      });
  });
  it('/api/chat/name (GET) - chat_id must be a uuid', () => {
    return getAuthorized('/api/chat/name/a', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });
  it('/api/chat/name (GET) - chat_id must not be a random uuid', () => {
    return getAuthorized(
      '/api/chat/name/a2c996be-4d14-4a39-aa20-052c1b57de06',
      500,
      {
        statusCode: 500,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/name (GET) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearer_value)
      .expect(201)
      .then((res) => {
        return getPublic('/api/chat/name/' + res.body.chat_id, 500, {
          statusCode: 500,
          message: 'Internal server error',
        });
      });
  });
});
