import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import LobbyManager from './LobbyManager';
import { MatchService } from '../user/match.service';
import { Gamemode } from '../user/match.entity';

@Injectable()
export class GameService {
  private lobbyManager: LobbyManager;

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
    inviter: Socket,
    invitedIntraId: number,
    gamemode: Gamemode,
    clients: Map<number, Socket[]>,
  ) {
    const inviterIntraId = inviter.data.intra_id;

    if (inviterIntraId === invitedIntraId) {
      throw new WsException("You can't invite yourself to a game");
    }

    if (!(await this.userService.hasUser(invitedIntraId))) {
      throw new WsException('Could not find invited user');
    }

    const invitedSockets = clients.get(invitedIntraId);
    if (!invitedSockets) {
      throw new WsException('Invited user is not online');
    }

    if (this.lobbyManager.isUserAlreadyInLobby(inviterIntraId)) {
      throw new WsException('You are already in a lobby');
    }

    // TODO: User can't invite person if person isn't online
    // TODO: Don't allow user to invite people while user is in queue
    await this.lobbyManager.createPrivateLobby(
      inviter,
      inviterIntraId,
      invitedIntraId,
      gamemode,
    );

    inviter.emit('inQueue', { inQueue: true });

    await this.lobbyManager.updateInvitations(invitedSockets, invitedIntraId);
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

  public async acceptInvitation(
    client: Socket,
    acceptedIntraId: number,
    clients: Map<number, Socket[]>,
  ) {
    // console.log('In acceptInvitation(), acceptedIntraId is', acceptedIntraId);

    if (!(await this.userService.hasUser(acceptedIntraId))) {
      throw new WsException('Could not find user');
    }

    const acceptedSockets = clients.get(acceptedIntraId);
    if (!acceptedSockets || acceptedSockets.length < 1) {
      throw new WsException('Accepted user is not online');
    }

    client.emit('inQueue', { inQueue: true });

    const lobby = this.lobbyManager.intraIdToLobby.get(acceptedIntraId);

    await lobby.addClient(client);
    this.lobbyManager.intraIdToLobby.set(client.data.intra_id, lobby);

    const mySockets = clients.get(client.data.intra_id);
    await this.lobbyManager.updateInvitations(mySockets, client.data.intra_id);
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

    this.removeClient(declinedSockets[0]);

    clients.get(declinedIntraId).forEach((socket) => {
      socket.emit('inQueue', { inQueue: false });
    });

    const mySockets = clients.get(client.data.intra_id);
    await this.lobbyManager.updateInvitations(mySockets, client.data.intra_id);
  }

  public async getInvitations(intra_id: number) {
    return await this.lobbyManager.getInvitations(intra_id);
  }
}
