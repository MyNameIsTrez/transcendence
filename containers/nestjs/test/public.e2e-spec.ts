import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Jwt2faAuthGuard } from '../src/auth/jwt-2fa-auth.guard';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../src/user/user.service';

// This constantly monitors if there are any socket leaks
require('leaked-handles');

describe('App (e2e)', () => {
  let app: INestApplication;
  let bearerValue: string;
  let userService: UserService;

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

    userService = moduleRef.get<UserService>(UserService);

    await app.init();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await app.close();
  });

  async function addUser() {
    await userService.create(intraId, 'foo', 'foo');
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
  function postAuthorized(path, sent, expectedStatus, expectedBody) {
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

  it('/api/chats/create (POST) - PUBLIC', async () => {
    await addUser();
    return postAuthorized(
      '/api/chats/create',
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
  it('/api/chats/create (POST) - PROTECTED', async () => {
    await addUser();
    return postAuthorized(
      '/api/chats/create',
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
  it('/api/chats/create (POST) - PRIVATE', async () => {
    await addUser();
    return postAuthorized(
      '/api/chats/create',
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
  it('/api/chats/create (POST) - empty name', async () => {
    await addUser();
    return postAuthorized(
      '/api/chats/create',
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
  it('/api/chats/create (POST) - unrecognized visibility', async () => {
    await addUser();
    return postAuthorized(
      '/api/chats/create',
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
  it('/api/chats/create (POST) - empty password', async () => {
    await addUser();
    return postAuthorized(
      '/api/chats/create',
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
  it('/api/chats/create (POST) - unauthorized', async () => {
    await addUser();
    return postPublic('/api/chats/create', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chats/chats (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/chats', HttpStatus.OK, ['uuid1', 'uuid2']);
  });
  it('/api/chats/chats (GET) - user not in database', () => {
    return getAuthorized('/api/chats/chats', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chats/chats (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chats/chats', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chats/name (GET)', async () => {
    await addUser();
    return request(app.getHttpServer())
      .post('/api/chats/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearerValue)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        return getAuthorized(
          '/api/chats/name/' + res.body.chat_id,
          HttpStatus.OK,
          'foo',
        );
      });
  });
  it('/api/chats/name (GET) - chat_id must be a uuid', async () => {
    await addUser();
    return getAuthorized(
      '/api/chats/name/a',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chats/name (GET) - chat_id must not be a random uuid', async () => {
    await addUser();
    return getAuthorized(
      '/api/chats/name/a2c996be-4d14-4a39-aa20-052c1b57de06',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chats/name (GET) - unauthorized', async () => {
    await addUser();
    return request(app.getHttpServer())
      .post('/api/chats/create')
      .send({ name: 'foo', visibility: 'PUBLIC', password: 'foo' })
      .set('Content-Type', 'application/json')
      .set('Authorization', bearerValue)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        return getPublic(
          '/api/chats/name/' + res.body.chat_id,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          },
        );
      });
  });

  it('/api/chats/users (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/users', HttpStatus.OK, [42, 69, 420]);
  });
  it('/api/chats/users (GET) - user not in database', () => {
    return getAuthorized('/api/chats/users', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chats/users (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chats/users', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chats/history (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/history', HttpStatus.OK, [
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
  it('/api/chats/history (GET) - user not in database', () => {
    return getAuthorized(
      '/api/chats/history',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chats/history (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chats/history', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chats/visibility (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/visibility', HttpStatus.OK, 'PUBLIC');
  });
  it('/api/chats/visibility (GET) - user not in database', () => {
    return getAuthorized(
      '/api/chats/visibility',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chats/visibility (GET) - unauthorized', async () => {
    await addUser();
    return getPublic(
      '/api/chats/visibility',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });

  it('/api/chats/owner (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/owner', HttpStatus.OK, '42');
  });
  it('/api/chats/owner (GET) - user not in database', () => {
    return getAuthorized('/api/chats/owner', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chats/owner (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chats/owner', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chats/admins (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/admins', HttpStatus.OK, [42, 69]);
  });
  it('/api/chats/admins (GET) - user not in database', () => {
    return getAuthorized(
      '/api/chats/admins',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chats/admins (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chats/admins', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chats/banned (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/banned', HttpStatus.OK, [7, 666]);
  });
  it('/api/chats/banned (GET) - user not in database', () => {
    return getAuthorized(
      '/api/chats/banned',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/chats/banned (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chats/banned', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('/api/chats/muted (GET)', async () => {
    await addUser();
    return getAuthorized('/api/chats/muted', HttpStatus.OK, [42, 69]);
  });
  it('/api/chats/muted (GET) - user not in database', () => {
    return getAuthorized('/api/chats/muted', HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
  it('/api/chats/muted (GET) - unauthorized', async () => {
    await addUser();
    return getPublic('/api/chats/muted', HttpStatus.INTERNAL_SERVER_ERROR, {
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
      HttpStatus.NO_CONTENT,
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
      '/api/chats/create',
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

  // TODO: Make this test pass
  // it('/api/user/profilePicture/:intra_id (GET)', async () => {
  //   await addUser();
  //   return getAuthorized(
  //     `/api/user/profilePicture/${intraId}`,
  //     HttpStatus.OK,
  //     intraId.toString(),
  //   );
  // });
  // TODO: Make this test pass
  // it('/api/user/profilePicture/:intra_id (GET) - profile picture not in database', async () => {
  //   await addUser();
  //   return getAuthorized(
  //     '/api/user/profilePicture/42',
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //     {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: 'Internal server error',
  //     },
  //   );
  // });
  it('/api/user/profilePicture/:intra_id (GET) - user not in database', () => {
    return getAuthorized(
      `/api/user/profilePicture/${intraId}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
  it('/api/user/profilePicture/:intra_id (GET) - unauthorized', async () => {
    await addUser();
    return getPublic(
      `/api/user/profilePicture/${intraId}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });

  // TODO: Make this test pass
  // it('/api/user/profilePicture (POST)', async () => {
  //   await addUser();
  //   await postAuthorized(
  //     '/api/user/profilePicture',
  //     ???some sort of way to read a png and send it here,
  //     HttpStatus.NO_CONTENT,
  //     '',
  //   );
  //   return getAuthorized('/api/user/username', HttpStatus.OK, 'bar');
  // });
  it('/api/user/profilePicture (POST) - invalid body', async () => {
    await addUser();
    return postAuthorized(
      '/api/user/profilePicture',
      { a: 'b' },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        message: 'Internal server error',
        statusCode: 500,
      },
    );
  });
  it('/api/user/profilePicture (POST) - user does not exist', async () => {
    return postAuthorized(
      '/api/user/profilePicture',
      { a: 'b' },
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        message: 'Internal server error',
        statusCode: 500,
      },
    );
  });
  it('/api/user/profilePicture (POST) - unauthorized', async () => {
    await addUser();
    return postPublic(
      '/api/user/profilePicture',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    );
  });
});
