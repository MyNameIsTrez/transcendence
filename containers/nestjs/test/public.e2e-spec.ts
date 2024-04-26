import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../src/users/users.service';

// This constantly monitors if there are any socket leaks
require('leaked-handles');

describe('App (e2e)', () => {
  let app: INestApplication;
  let bearer_value: string;
  let usersService: UsersService;

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
    bearer_value = 'Bearer ' + bearer_token;

    usersService = moduleRef.get<UsersService>(UsersService);

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
      .then((res) =>
        expect(
          Object.keys(res.body).length > 0 ? res.body : res.text,
        ).toStrictEqual(expectedBody),
      );
  }
  async function postAuthorized(path, sent, expectedStatus, expectedBody) {
    return request(app.getHttpServer())
      .post(path)
      .send(sent)
      .set('Content-Type', 'application/json')
      .set('Authorization', bearer_value)
      .expect(expectedStatus)
      .then((res) =>
        expect(
          Object.keys(res.body).length > 0 ? res.body : res.text,
        ).toStrictEqual(expectedBody),
      );
  }

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
        return getAuthorized('/api/chat/name/' + res.body.chat_id, 200, 'foo');
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

  it('/api/chat/users (GET)', () => {
    return getAuthorized('/api/chat/users', 200, [42, 69, 420]);
  });
  it('/api/chat/users (GET) - unauthorized', () => {
    return getPublic('/api/chat/users', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/history (GET)', () => {
    return getAuthorized('/api/chat/history', 200, [
      {
        sender: 42,
        body: 'hello',
      },
      {
        sender: 69,
        body: 'world',
      },
      {
        sender: 420,
        body: 'lmao',
      },
    ]);
  });
  it('/api/chat/history (GET) - unauthorized', () => {
    return getPublic('/api/chat/history', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/visibility (GET)', () => {
    return getAuthorized('/api/chat/visibility', 200, 'PUBLIC');
  });
  it('/api/chat/visibility (GET) - unauthorized', () => {
    return getPublic('/api/chat/visibility', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/owner (GET)', () => {
    return getAuthorized('/api/chat/owner', 200, '42');
  });
  it('/api/chat/owner (GET) - unauthorized', () => {
    return getPublic('/api/chat/owner', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/admins (GET)', () => {
    return getAuthorized('/api/chat/admins', 200, [42, 69]);
  });
  it('/api/chat/admins (GET) - unauthorized', () => {
    return getPublic('/api/chat/admins', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/banned (GET)', () => {
    return getAuthorized('/api/chat/banned', 200, [7, 666]);
  });
  it('/api/chat/banned (GET) - unauthorized', () => {
    return getPublic('/api/chat/banned', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/chat/muted (GET)', () => {
    return getAuthorized('/api/chat/muted', 200, [42, 69]);
  });
  it('/api/chat/muted (GET) - unauthorized', () => {
    return getPublic('/api/chat/muted', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/public/leaderboard (GET)', () => {
    return getPublic('/api/public/leaderboard', 200, {
      sander: 42,
      victor: 69,
    });
  });

  it('/api/user/username (GET)', async () => {
    await usersService.create({
      intra_id: 76657,
      username: 'foo',
      email: 'foo',
      my_chats: [],
    });
    return getAuthorized('/api/user/username', 200, 'foo');
  });
  it('/api/user/username (GET) - not in database', () => {
    return getAuthorized('/api/user/username', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });
  it('/api/user/username (GET) - unauthorized', () => {
    return getPublic('/api/user/username', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('/api/user/setUsername (POST)', async () => {
    await usersService.create({
      intra_id: 76657,
      username: 'bar',
      email: 'foo',
      my_chats: [],
    });
    return postAuthorized(
      '/api/user/setUsername',
      {
        username: 'foo',
      },
      204,
      '',
    );
  });
  it('/api/user/setUsername (POST) - empty username', async () => {
    return await postAuthorized(
      '/api/user/setUsername',
      {
        username: '',
      },
      500,
      {
        message: 'Internal server error',
        statusCode: 500,
      },
    );
  });
  it('/api/user/setUsername (POST) - user does not exist', async () => {
    return postAuthorized(
      '/api/user/setUsername',
      {
        username: 'foo',
      },
      500,
      {
        message: 'Internal server error',
        statusCode: 500,
      },
    );
  });
  it('/api/user/setUsername (POST) - unauthorized', () => {
    return postPublic('/api/user/setUsername', 500, {
      statusCode: 500,
      message: 'Internal server error',
    });
  });
});
