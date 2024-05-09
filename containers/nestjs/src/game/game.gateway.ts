import {
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import LobbyManager from './LobbyManager';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'game' })
export class GameGateway {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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

      // Ideally we'd throw an exception, but it seems to always crash handleConnection()
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
    // console.log(`User ${client.data.intra_id} disconnected game socket`);
    this.lobbyManager.removeClient(client);
  }

  afterInit() {
    this.lobbyManager = new LobbyManager(this.server, this.configService);
    this.lobbyManager.updateLoop();
  }

  @SubscribeMessage('joinGame')
  async joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody('mode') mode: string,
  ) {
    this.lobbyManager.queue(client, mode);
  }

  @SubscribeMessage('movePaddle')
  async movePaddle(
    @ConnectedSocket() client: Socket,
    @MessageBody('keydown') keydown: boolean,
    @MessageBody('north') north: boolean,
  ) {
    client.data.lobby?.movePaddle(client.data.playerIndex, keydown, north);
  }
}
