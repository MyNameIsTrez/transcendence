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

  clients = new Map<number, Socket[]>();

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
      const intra_id = decoded.sub;
      client.data.intra_id = intra_id;

      let sockets = this.clients.get(intra_id);
      if (!sockets) {
        sockets = [];
        this.clients.set(intra_id, sockets);
      }
      sockets.push(client);
    } catch (e) {
      console.error('Disconnecting client, because verifying their jwt failed');
      client.emit('exception', {
        errorMessage: 'Verifying jwt failed',
        redirectToLoginPage: true,
      });
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    // TODO: Add the logic to leave a custom lobby that was created for invites only (Example: A invites B, but A closes the tab before B joined)
    console.log(`Client ${client.id} disconnected game socket`);
    this.lobbyManager.removeClient(client);
    this.removeClient(client);
  }

  private removeClient(client: Socket) {
    const intra_id = client.data.intra_id;
    const clientSockets = this.clients.get(intra_id);
    const index = clientSockets.indexOf(client);
    if (index > -1) {
      clientSockets.splice(index, 1);
    }
    if (clientSockets.length === 0) {
      this.clients.delete(intra_id);
    }
  }

  afterInit() {
    this.lobbyManager = new LobbyManager(
      this.server,
      this.usersService,
      this.matchService,
    );
    this.lobbyManager.updateLoop();
  }

  @SubscribeMessage('queue')
  async queue(
    @ConnectedSocket() client: Socket,
    @MessageBody('gamemode') gamemode: Gamemode,
  ) {
    // TODO: Don't allow user to join regular queue while waiting in an invite only queue
    await this.lobbyManager.queue(client, gamemode);
  }

  @SubscribeMessage('leaveQueue')
  async leaveQueue(@ConnectedSocket() client: Socket) {
    this.lobbyManager.removeClient(client);
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
