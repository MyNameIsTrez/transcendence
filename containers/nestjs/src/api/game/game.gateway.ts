import { ValidationPipe, UsePipes, UseFilters } from '@nestjs/common';
import {
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BadRequestTransformFilter } from '../../bad-request-transform.filter';
import TransJwtService from '../../auth/trans-jwt-service';
import { Gamemode } from '../../user/match.entity';
import { GameService } from '../../game/game.service';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'game' })
@UseFilters(BadRequestTransformFilter)
@UsePipes(new ValidationPipe())
export class GameGateway {
  constructor(
    private readonly gameService: GameService,
    private readonly transJwtService: TransJwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  clients = new Map<number, Socket[]>();

  afterInit() {
    this.gameService.init(this.server);
  }

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

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.gameService.removeClient(client);
    this.disconnectSocket(client, client.data.intra_id);
  }

  private disconnectSocket(client: Socket, intra_id: number) {
    const clientSockets = this.clients.get(intra_id);
    const index = clientSockets.indexOf(client);
    if (index > -1) {
      clientSockets.splice(index, 1);
    }
    if (clientSockets.length === 0) {
      this.clients.delete(intra_id);
    }
  }

  @SubscribeMessage('queue')
  async queue(
    @ConnectedSocket() client: Socket,
    @MessageBody('gamemode') gamemode: Gamemode,
  ) {
    await this.gameService.queue(client, gamemode);
  }

  @SubscribeMessage('leaveQueue')
  async leaveQueue(@ConnectedSocket() client: Socket) {
    await this.gameService.leaveQueue(client, this.clients);
  }

  @SubscribeMessage('createPrivateLobby')
  async createPrivateLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody('invitedUser') invitedIntraId: number,
    @MessageBody('gamemode') gamemode: Gamemode,
  ) {
    await this.gameService.createPrivateLobby(
      client,
      invitedIntraId,
      gamemode,
      this.clients,
    );
  }

  @SubscribeMessage('movePaddle')
  async movePaddle(
    @ConnectedSocket() client: Socket,
    @MessageBody('keydown') keydown: boolean,
    @MessageBody('north') north: boolean,
  ) {
    this.gameService.movePaddle(
      client.data.intra_id,
      client.data.playerIndex,
      keydown,
      north,
    );
  }

  @SubscribeMessage('acceptInvitation')
  async acceptInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody('acceptedIntraId') acceptedIntraId: number,
  ) {
    await this.gameService.acceptInvitation(
      client,
      acceptedIntraId,
      this.clients,
    );
  }

  @SubscribeMessage('declineInvitation')
  async declineInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody('declinedIntraId') declinedIntraId: number,
  ) {
    await this.gameService.declineInvitation(
      client,
      declinedIntraId,
      this.clients,
    );
  }
}
