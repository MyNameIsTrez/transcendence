import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import LobbyManager from './LobbyManager';
import { MatchService } from '../user/match.service';
import { Gamemode } from '../user/match.entity';
import Invitation from './invitation';
import { ConfigService } from '@nestjs/config';
import Lobby from './Lobby';
import UserSockets from 'src/user/user.sockets';

@Injectable()
export class GameService {
  private lobbyManager: LobbyManager;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly matchService: MatchService,
    private readonly configService: ConfigService,
    private readonly userSockets: UserSockets,
  ) {}

  async init(server: Server) {
    this.lobbyManager = new LobbyManager(
      server,
      this.userService,
      this.matchService,
      this.configService,
      this.userSockets,
    );
    await this.lobbyManager.startUpdateLoop();
  }

  public findLobbyByIntraId(intra_id: number): Lobby | undefined {
    return this.lobbyManager.intraIdToLobby.get(intra_id);
  }

  public async queue(client: Socket, gamemode: Gamemode) {
    await this.lobbyManager.queue(client, gamemode);
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

    inviter.emit('enteredQueue');

    const inviterName = await this.userService.getUsername(inviterIntraId);

    await this.lobbyManager.sendInvitation(
      invitedSockets,
      new Invitation(inviterIntraId, inviterName, gamemode),
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

  public async removeClient(client: Socket, clients: Map<number, Socket[]>) {
    await this.lobbyManager.removeClient(client, clients);
  }

  public async acceptInvitation(
    client: Socket,
    acceptedIntraId: number,
    clients: Map<number, Socket[]>,
  ) {
    if (this.lobbyManager.isUserAlreadyInLobby(client.data.intra_id)) {
      await this.removeClient(client, clients);
    }

    if (!(await this.userService.hasUser(acceptedIntraId))) {
      throw new WsException('Could not find user');
    }

    const acceptedSockets = clients.get(acceptedIntraId);
    if (!acceptedSockets || acceptedSockets.length < 1) {
      throw new WsException('Accepted user is not online');
    }

    const lobby = this.lobbyManager.intraIdToLobby.get(acceptedIntraId);
    if (!lobby) {
      throw new WsException("This lobby doesn't exist");
    }

    client.emit('enteredQueue');

    await lobby.addClient(client);
    this.lobbyManager.intraIdToLobby.set(client.data.intra_id, lobby);
  }

  public async declineInvitation(
    declinedIntraId: number,
    clients: Map<number, Socket[]>,
  ) {
    if (!(await this.userService.hasUser(declinedIntraId))) {
      throw new WsException('Could not find user');
    }

    const declinedSockets = clients.get(declinedIntraId);
    if (!declinedSockets || declinedSockets.length < 1) {
      throw new WsException('Declined user is not online');
    }

    await this.removeClient(declinedSockets[0], clients);

    clients.get(declinedIntraId).forEach((socket) => {
      socket.emit('leftQueue');
    });
  }

  public async getInvitations(intra_id: number) {
    return await this.lobbyManager.getInvitations(intra_id);
  }
}
