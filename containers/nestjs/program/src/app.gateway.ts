import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

// cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
