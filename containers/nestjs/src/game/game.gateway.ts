import { ValidationPipe, UsePipes, UseFilters } from '@nestjs/common';
import {
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import LobbyManager from './LobbyManager';
import { BadRequestTransformFilter } from '../bad-request-transform.filter';
import TransJwtService from '../auth/trans-jwt-service';
import { MatchService } from '../users/match.service';
import { Gamemode } from '../users/match.entity';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'game' })
@UseFilters(BadRequestTransformFilter)
@UsePipes(new ValidationPipe())
export class GameGateway {
  constructor(
    private transJwtService: TransJwtService,
    private readonly usersService: UsersService,
    private readonly matchService: MatchService,
  ) {}

  @WebSocketServer()
  server: Server;

  lobbyManager: LobbyManager;

  handleConnection(@ConnectedSocket() client: Socket) {
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
    }

    const jwt = authorization.split(' ')[1];

    try {
      const decoded = this.transJwtService.verify(jwt);
      client.data.intra_id = decoded.sub;
    } catch (e) {
      console.error('Disconnecting client, because verifying their jwt failed');
      client.emit('exception', {
        errorMessage: 'Verifying jwt failed',
        redirectToLoginPage: true,
      });
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client ${client.id} disconnected game socket`);
    this.lobbyManager.removeClient(client);
  }

  afterInit() {
    this.lobbyManager = new LobbyManager(
      this.server,
      this.usersService,
      this.matchService,
    );
    this.lobbyManager.updateLoop();
  }

  @SubscribeMessage('joinGame')
  async joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody('gamemode') gamemode: Gamemode,
  ) {
    await this.lobbyManager.queue(client, gamemode);
  }

  @SubscribeMessage('movePaddle')
  async movePaddle(
    @ConnectedSocket() client: Socket,
    @MessageBody('keydown') keydown: boolean,
    @MessageBody('north') north: boolean,
  ) {
    client.data.lobby?.movePaddle(client.data.playerIndex, keydown, north);
  }

  // This assumes a ChatGateway connection is always present,
  // so it might be worth it to make a new socket connection
  // just for checking if the user is online
  // TODO: Move this to the ChatGateway?
  @SubscribeMessage('heartbeat')
  heartbeat(client: Socket) {
    // console.log(`Got heartbeat from client ${client.data.intra_id}`);
    this.usersService.updateLastOnline(client.data.intra_id);
  }
}
