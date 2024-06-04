import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import LobbyManager from './LobbyManager';
import { MatchService } from '../user/match.service';
import { Gamemode } from '../user/match.entity';

@Injectable()
export class GameService {
  lobbyManager: LobbyManager;

  constructor(
    private readonly userService: UserService,
    private readonly matchService: MatchService,
  ) {}

  init(server: Server) {
    this.lobbyManager = new LobbyManager(
      server,
      this.userService,
      this.matchService,
    );
    this.lobbyManager.startUpdateLoop();
  }

  public async queue(client: Socket, gamemode: Gamemode) {
    // TODO: Don't allow user to join regular queue while waiting in an invite only queue
    await this.lobbyManager.queue(client, gamemode);
  }

  public async leaveQueue(client: Socket, clients: Map<number, Socket[]>) {
    await this.lobbyManager.leaveQueue(client, clients);
  }

  public async createPrivateLobby(
    client: Socket,
    invitedIntraId: number,
    gamemode: Gamemode,
    clients: Map<number, Socket[]>,
  ) {
    if (!(await this.userService.hasUser(invitedIntraId))) {
      throw new WsException('Could not find user');
    }

    const invitedSockets = clients.get(invitedIntraId);
    if (!invitedSockets) {
      throw new WsException('Invited user is not online');
    }

    // TODO: User can't invite person if person isn't online
    // TODO: Don't allow user to invite people while user is in queue
    await this.lobbyManager.createPrivateLobby(
      client,
      invitedIntraId,
      gamemode,
      invitedSockets,
    );
  }

  public movePaddle(
    intra_id: number,
    playerIndex: number,
    keydown: boolean,
    north: boolean,
  ) {
    this.lobbyManager.movePaddle(intra_id, playerIndex, keydown, north);
  }

  public async removeClient(client: Socket) {
    await this.lobbyManager.removeClient(client);
  }

  public async requestInvitations(client: Socket) {
    const invitations = await this.lobbyManager.getInvitations(
      client.data.intra_id,
    );
    client.emit('updateInvitations', invitations);
  }

  public async acceptInvitation(
    client: Socket,
    acceptedIntraId: number,
    clients: Map<number, Socket[]>,
  ) {
    console.log('In acceptInvitation(), acceptedIntraId is', acceptedIntraId);

    if (!(await this.userService.hasUser(acceptedIntraId))) {
      throw new WsException('Could not find user');
    }

    const acceptedSockets = clients.get(acceptedIntraId);
    if (!acceptedSockets || acceptedSockets.length < 1) {
      throw new WsException('Accepted user is not online');
    }

    client.emit('inQueue', { inQueue: true });

    const invitations = await this.lobbyManager.getInvitations(
      client.data.intra_id,
    );
    clients.get(client.data.intra_id).forEach((socket) => {
      socket.emit('updateInvitations', invitations);
    });

    const lobby = this.lobbyManager.intraIdToLobby.get(acceptedIntraId);

    await lobby.addClient(client);
    this.lobbyManager.intraIdToLobby.set(client.data.intra_id, lobby);
  }

  public async declineInvitation(
    client: Socket,
    declinedIntraId: number,
    clients: Map<number, Socket[]>,
  ) {
    console.log('In declineInvitation(), declinedIntraId is', declinedIntraId);

    if (!(await this.userService.hasUser(declinedIntraId))) {
      throw new WsException('Could not find user');
    }

    const declinedSockets = clients.get(declinedIntraId);
    if (!declinedSockets || declinedSockets.length < 1) {
      throw new WsException('Declined user is not online');
    }

    this.lobbyManager.removeClient(declinedSockets[0]);

    clients.get(declinedIntraId).forEach((socket) => {
      socket.emit('inQueue', { inQueue: false });
    });

    const invitations = await this.lobbyManager.getInvitations(
      client.data.intra_id,
    );
    clients.get(client.data.intra_id).forEach((socket) => {
      socket.emit('updateInvitations', invitations);
    });
  }
}
