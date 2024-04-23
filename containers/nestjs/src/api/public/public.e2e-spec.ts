import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

require('leaked-handles'); // TODO: Remove?

describe('PublicController (e2e)', () => {
  let app: INestApplication;
  // let server: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    // server = app.getHttpServer();
  });

  it('/api/public/leaderboard (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/public/leaderboard')
      .expect(200)
      .expect({ sander: 42, victor: 69 });
  });

  // TODO:
  // it('/api/chat/create (POST)', () => {
  //   return request(app.getHttpServer())
  //     .post('/api/chat/create')
  //     .expect(200)
  //     .expect({ sander: 42, victor: 69 });
  // });

  afterEach(async () => {
    console.log('foo');
    await app.close();
    console.log('bar');
    // server.close();
    console.log('baz');
  });
});
