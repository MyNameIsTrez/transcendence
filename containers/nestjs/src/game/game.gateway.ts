import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import LobbyManager from './LobbyManager';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'game' })
export class GameGateway {
  constructor(private jwtService: JwtService) {}

  @WebSocketServer()
  server: Server;

  lobbyManager: LobbyManager;

  handleConnection(client: Socket) {
    console.log(`Client ${client.id} connected to game socket`);

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

      // Ideally we'd throw an exception,
      // but I (Sander) couldn't figure out how to make it not crash NestJS
      // client.disconnect();
      // throw new WsException(
      //   'Disconnecting client, because they had no authorization header',
      // );
    }

    const jwt = authorization.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(jwt);
      client.data.intra_id = decoded.sub;
    } catch (e) {
      console.error('Disconnecting client, because verifying their jwt failed');
      client.emit('exception', {
        errorMessage: 'Verifying jwt failed',
        redirectToLoginPage: true,
      });
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected game socket`);
  }

  afterInit() {
    this.lobbyManager = new LobbyManager(this.server);
    this.lobbyManager.updateLoop();
  }

  @SubscribeMessage('joinGame')
  async joinGame(@ConnectedSocket() client: Socket) {
    this.lobbyManager.queue(client);
  }
}
