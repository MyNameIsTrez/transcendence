import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Jwt2faAuthGuard } from '../src/auth/jwt-2fa-auth.guard';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../src/users/users.service';

// This constantly monitors if there are any socket leaks
require('leaked-handles');

describe('App (e2e)', () => {
  let app: INestApplication;
  let bearerValue: string;
  let usersService: UsersService;

  const intraId = 76657;

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

    // This fixes reflector not being injected into Jwt2faAuthGuard,
    // but requires manually commenting out the global Jwt2faAuthGuard in auth.module.ts
    app.useGlobalGuards(new Jwt2faAuthGuard(new Reflector()));

    const bearer_token = app.get(ConfigService).get('TEST_BEARER_TOKEN');
    bearerValue = 'Bearer ' + bearer_token;

    usersService = moduleRef.get<UsersService>(UsersService);

    await app.init();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await app.close();
  });

  async function addUser() {
    await usersService.create({
      intra_id: intraId,
      username: 'foo',
      email: 'foo',
      isTwoFactorAuthenticationEnabled: false,
      twoFactorAuthenticationSecret: null,
      my_chats: [],
    });
  }

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
      .set('Authorization', bearerValue)
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
      .set('Authorization', bearerValue)
      .expect(expectedStatus)
      .then((res) =>
        expect(
          Object.keys(res.body).length > 0 ? res.body : res.text,
        ).toStrictEqual(expectedBody),
      );
  }

  it('/api/chat/create (POST) - PUBLIC', async () => {
    await addUser();
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PUBLIC',
        password: 'foo',
      },
      HttpStatus.CREATED,
      {
        chat_id: expect.any(String),
        name: 'foo',
        users: [intraId],
        history: [],
        visibility: 'PUBLIC',
        hashed_password: '',
        owner: intraId,
        admins: [intraId],
        banned: [],
        muted: [],
      },
    );
  });
  it('/api/chat/create (POST) - PROTECTED', async () => {
    await addUser();
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PROTECTED',
        password: 'foo',
      },
      HttpStatus.CREATED,
      {
        chat_id: expect.any(String),
        name: 'foo',
        users: [intraId],
        history: [],
        visibility: 'PROTECTED',
        hashed_password: 'foo',
        owner: intraId,
        admins: [intraId],
        banned: [],
        muted: [],
      },
    );
  });
  it('/api/chat/create (POST) - PRIVATE', async () => {
    await addUser();
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PRIVATE',
        password: 'foo',
      },
      HttpStatus.CREATED,
      {
        chat_id: expect.any(String),
        name: 'foo',
        users: [intraId],
        history: [],
        visibility: 'PRIVATE',
        hashed_password: '',
        owner: intraId,
        admins: [intraId],
        banned: [],
        muted: [],
      },
    );
  });
  it('/api/chat/create (POST) - empty name', async () => {
    await addUser();
    return postAuthorized(
      '/api/chat/create',
      {
        name: '',
        visibility: 'PUBLIC',
        password: 'foo',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/create (POST) - unrecognized visibility', async () => {
    await addUser();
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'foo',
        password: 'foo',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/create (POST) - empty password', async () => {
    await addUser();
    return postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PUBLIC',
        password: '',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/create (POST) - unauthorized', async () => {
    await addUser();
    return postPublic('/api/chat/create', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/chats (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/chats', HttpStatus.OK, ['uuid1', 'uuid2']);
  });
  it('/api/chat/chats (GET) - user not in database', () => {
    return getAuthorized('/api/chat/chats', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chat/chats (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/chats', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/name (GET)', async () => {
    await addUser();
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearerValue)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        return getAuthorized(
          '/api/chat/name/' + res.body.chat_id,
          HttpStatus.OK,
          'foo',
        );
      });
  });
  it('/api/chat/name (GET) - chat_id must be a uuid', async () => {
    await addUser();
    return getAuthorized('/api/chat/name/a', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chat/name (GET) - chat_id must not be a random uuid', async () => {
    await addUser();
    return getAuthorized(
      '/api/chat/name/a2c996be-4d14-4a39-aa20-052c1b57de06',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/name (GET) - unauthorized', async () => {
    await addUser();
    return request(app.getHttpServer())
      .post('/api/chat/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearerValue)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        return getPublic(
          '/api/chat/name/' + res.body.chat_id,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          },
        );
      });
  });

  it('/api/chat/users (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/users', HttpStatus.OK, [42, 69, 420]);
  });
  it('/api/chat/users (GET) - user not in database', () => {
    return getAuthorized('/api/chat/users', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chat/users (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/users', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/history (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/history', HttpStatus.OK, [
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
  it('/api/chat/history (GET) - user not in database', () => {
    return getAuthorized(
      '/api/chat/history',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/history (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/history', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/visibility (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/visibility', HttpStatus.OK, 'PUBLIC');
  });
  it('/api/chat/visibility (GET) - user not in database', () => {
    return getAuthorized(
      '/api/chat/visibility',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chat/visibility (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/visibility', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/owner (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/owner', HttpStatus.OK, '42');
  });
  it('/api/chat/owner (GET) - user not in database', () => {
    return getAuthorized('/api/chat/owner', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chat/owner (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/owner', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/admins (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/admins', HttpStatus.OK, [42, 69]);
  });
  it('/api/chat/admins (GET) - user not in database', () => {
    return getAuthorized('/api/chat/admins', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chat/admins (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/admins', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/banned (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/banned', HttpStatus.OK, [7, 666]);
  });
  it('/api/chat/banned (GET) - user not in database', () => {
    return getAuthorized('/api/chat/banned', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chat/banned (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/banned', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chat/muted (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chat/muted', HttpStatus.OK, [42, 69]);
  });
  it('/api/chat/muted (GET) - user not in database', () => {
    return getAuthorized('/api/chat/muted', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chat/muted (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chat/muted', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/public/leaderboard (GET)', () => {
    return getPublic('/api/public/leaderboard', HttpStatus.OK, {
      sander: 42,
      victor: 69,
    });
  });

  it('/api/user/username (GET)', async () => {
    await addUser();
    return getAuthorized('/api/user/username', HttpStatus.OK, 'foo');
  });
  it('/api/user/username (GET) - user not in database', () => {
    return getAuthorized(
      '/api/user/username',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/user/username (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/user/username', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/user/setUsername (POST)', async () => {
    await addUser();
    await postAuthorized(
      '/api/user/setUsername',
      {
        username: 'bar',
      },
      204,
      '',
    );
    return getAuthorized('/api/user/username', HttpStatus.OK, 'bar');
  });
  it('/api/user/setUsername (POST) - empty username', async () => {
    await addUser();
    return await postAuthorized(
      '/api/user/setUsername',
      {
        username: '',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    );
  });
  it('/api/user/setUsername (POST) - user does not exist', () => {
    return postAuthorized(
      '/api/user/setUsername',
      {
        username: 'foo',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    );
  });
  it('/api/user/setUsername (POST) - unauthorized', async () => {
    await addUser();
    return postPublic(
      '/api/user/setUsername',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });

  it('/api/user/intraId (GET)', async () => {
    await addUser();
    return getAuthorized(
      '/api/user/intraId',
      HttpStatus.OK,
      intraId.toString(),
    );
  });
  it('/api/user/intraId (GET) - user not in database', () => {
    return getAuthorized(
      '/api/user/intraId',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/user/intraId (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/user/intraId', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/user/myChats (GET)', async () => {
    await addUser();
    await getAuthorized('/api/user/myChats', HttpStatus.OK, '[]');
    await postAuthorized(
      '/api/chat/create',
      {
        name: 'foo',
        visibility: 'PUBLIC',
        password: 'foo',
      },
      HttpStatus.CREATED,
      {
        chat_id: expect.any(String),
        name: 'foo',
        users: [intraId],
        history: [],
        visibility: 'PUBLIC',
        hashed_password: '',
        owner: intraId,
        admins: [intraId],
        banned: [],
        muted: [],
      },
    );
    return getAuthorized('/api/user/myChats', HttpStatus.OK, [
      { chat_id: expect.any(String), name: 'foo' },
    ]);
  });
  it('/api/user/myChats (GET) - user not in database', () => {
    return getAuthorized(
      '/api/user/myChats',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/user/myChats (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/user/myChats', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  // it('/api/user/profilePicture/:intra_id.png (GET)', async () => {
  //   await addUser();
  //   return getAuthorized(
  //     `/api/user/profilePicture/${intraId}.png`,
  //     HttpStatus.OK,
  //     intraId.toString(),
  //   );
  // });
  // it('/api/user/profilePicture/:intra_id.png (GET) - profile picture not in database', () => {
  //   return getAuthorized(
  //     '/api/user/profilePicture/42.png',
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //     {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: 'Internal server error',
  //     },
  //   );
  // });
  // it('/api/user/profilePicture/:intra_id.png (GET) - user not in database', () => {
  //   return getAuthorized(`/api/user/profilePicture/${intraId}.png`, HttpStatus.INTERNAL_SERVER_ERROR, {
  //     statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //     message: 'Internal server error',
  //   });
  // });
  // it('/api/user/profilePicture/:intra_id.png (GET) - unauthorized', async () => {
  //   await addUser();
  //   return getPublic(`/api/user/profilePicture/${intraId}.png`, HttpStatus.INTERNAL_SERVER_ERROR, {
  //     statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //     message: 'Internal server error',
  //   });
  // });
});
