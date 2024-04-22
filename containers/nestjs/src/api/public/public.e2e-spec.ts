import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiPublicModule } from './public.module';

describe('PublicController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiPublicModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/public/leaderboard (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/public/leaderboard')
      .expect(200)
      .expect({ sander: 42, victor: 69 });
  });
});
