import { ValidationPipe, UsePipes, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../../user/user.service';
import { BadRequestTransformFilter } from '../../bad-request-transform.filter';
import TransJwtService from '../../auth/trans-jwt-service';
import UserSockets from '../../user/user.sockets';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'user' })
@UseFilters(BadRequestTransformFilter)
@UsePipes(new ValidationPipe())
export class UserGateway {
  constructor(
    private readonly transJwtService: TransJwtService,
    private readonly userService: UserService,
    private readonly userSockets: UserSockets,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    const authorization = client.handshake.headers.authorization;
    if (!authorization) {
      console.error(
        'Disconnecting client, because they had no authorization header',
      );
      client.emit('exception', {
        errorMessage: 'Missing the authorization header',
        redirectToLoginPage: true,
      });
      return;
    }

    const jwt = authorization.split(' ')[1];

    try {
      const decoded = this.transJwtService.verify(jwt);
      const intra_id = decoded.sub;
      client.data.intra_id = intra_id;
    } catch (e) {
      console.error('Disconnecting client, because verifying their jwt failed');
      client.emit('exception', {
        errorMessage: 'Verifying jwt failed',
        redirectToLoginPage: true,
      });
    }

    this.userSockets.add(client);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.userSockets.remove(client);
  }

  @SubscribeMessage('heartbeat')
  async heartbeat(client: Socket) {
    await this.userService.updateLastOnline(client.data.intra_id);
  }
}
