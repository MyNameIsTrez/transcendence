import { Server, Socket } from 'socket.io';
import Lobby from './Lobby';
import { WsException } from '@nestjs/websockets';
import { UserService } from '../user/user.service';
import { MatchService } from '../user/match.service';
import { Gamemode } from '../user/match.entity';
import Invitation from './invitation';
import { ConfigService } from '@nestjs/config';
import UserSockets from 'src/user/user.sockets';

export default class LobbyManager {
  private readonly lobbies = new Map<Lobby['id'], Lobby>();
  public readonly intraIdToLobby = new Map<number, Lobby>();

  private readonly updateIntervalMs = 1000 / 60;

  constructor(
    private readonly server: Server,
    private readonly userService: UserService,
    private readonly matchService: MatchService,
    private readonly configService: ConfigService,
    private readonly userSockets: UserSockets,
  ) {}

  public async queue(client: Socket, gamemode: Gamemode) {
    if (this.isUserAlreadyInLobby(client.data.intra_id)) {
      console.error(`User ${client.data.intra_id} is already in a lobby`);
      throw new WsException('Already in a lobby');
    }

    client.emit('enteredQueue');

    const lobby = this.getLobby(gamemode);
    await lobby.addClient(client);
    this.intraIdToLobby.set(client.data.intra_id, lobby);
  }

  public async sendInvitation(sockets: Socket[], invitation: Invitation) {
    sockets.forEach((socket) => {
      socket.emit('addInvitation', invitation);
    });
  }

  private async removeInvitation(sockets: Socket[], inviterIntraId: number) {
    sockets.forEach((socket) => {
      socket.emit('removeInvitation', inviterIntraId);
    });
  }

  public async createPrivateLobby(
    inviter: Socket,
    inviterIntraId: number,
    invitedIntraId: number,
    gamemode: Gamemode,
  ) {
    const lobby = new Lobby(
      gamemode,
      true,
      this.server,
      this.userService,
      this.matchService,
      this.configService,
      this.userSockets,
    );

    lobby.inviterIntraId = inviterIntraId;
    lobby.invitedIntraId = invitedIntraId;

    this.lobbies.set(lobby.id, lobby);
    await lobby.addClient(inviter);
    this.intraIdToLobby.set(inviterIntraId, lobby);
  }

  public isUserAlreadyInLobby(intra_id: number): boolean {
    return Array.from(this.lobbies.values()).some((lobby) =>
      lobby.hasUser(intra_id),
    );
  }

  private getLobby(gamemode: Gamemode): Lobby {
    const notFullLobby = Array.from(this.lobbies.values()).find(
      (lobby) =>
        lobby.pong.gamemode === gamemode && !lobby.isFull() && !lobby.isPrivate,
    );
    if (notFullLobby) {
      return notFullLobby;
    }

    const newLobby = new Lobby(
      gamemode,
      false,
      this.server,
      this.userService,
      this.matchService,
      this.configService,
      this.userSockets,
    );
    this.lobbies.set(newLobby.id, newLobby);
    return newLobby;
  }

  public movePaddle(
    intra_id: number,
    playerIndex: number,
    keydown: boolean,
    north: boolean,
  ) {
    const lobby = this.intraIdToLobby.get(intra_id);
    lobby?.movePaddle(playerIndex, keydown, north);
  }

  public async removeClient(client: Socket, clients: Map<number, Socket[]>) {
    const lobby = this.intraIdToLobby.get(client.data.intra_id);

    if (!lobby) {
      return;
    }

    // If a client disconnect while queueing, lobby.clients.size is 1
    const client_count = lobby.clients.size;

    const invitedSockets = clients.get(lobby.invitedIntraId) ?? [];
    invitedSockets.forEach((otherSocket) =>
      otherSocket.emit('removeGameInvite', client.data.intra_id),
    );

    if (client_count >= 2) {
      await lobby.saveMatch(
        await this.userService.findOne(client.data.intra_id),
      );
      await this.userService.addLoss(client.data.intra_id);
    }

    this.intraIdToLobby.delete(client.data.intra_id);
    await lobby.removeClient(client);

    // If one of the clients disconnects, the other client wins
    lobby.emit('gameOver', true);

    if (client_count >= 2) {
      lobby.clients.forEach(async (otherClient) => {
        await this.userService.addWin(otherClient.data.intra_id);
      });
    }

    await this.removeLobby(lobby);
  }

  public async startUpdateLoop() {
    setInterval(async () => {
      this.lobbies.forEach(async (lobby) => {
        if (lobby.gameHasStarted) {
          var toDelete = await lobby.update();
        }
        if (lobby.didSomeoneWin() && toDelete) {
          await this.removeLobby(lobby);
        }
      });
    }, this.updateIntervalMs);
  }

  private async removeLobby(lobby: Lobby) {
    lobby.clients.forEach(async (client) => {
      const user = await this.userService.findOne(client.data.intra_id, {
        friends: true,
      });
      if (user) {
        user.friends.forEach((friend) => {
          this.userSockets.emitToClient(
            friend.intra_id,
            'onlineFriend',
            client.data.intra_id,
          );
        });
      }

      this.intraIdToLobby.delete(client.data.intra_id);
    });

    await lobby.disconnectClients();
    this.lobbies.delete(lobby.id);
  }

  public async getInvitations(intra_id: number) {
    const lobbies = await Array.from(this.lobbies.values());

    // The .filter() and .map() here could be replaced with a .reduce()

    const filteredLobbies = lobbies.filter(
      (lobby) =>
        lobby.isPrivate &&
        lobby.invitedIntraId === intra_id &&
        !lobby.gameHasStarted,
    );

    const mappedLobbiesArray = await Promise.all(
      filteredLobbies.map(async (lobby) => {
        return new Invitation(
          lobby.inviterIntraId,
          await this.userService.getUsername(lobby.inviterIntraId),
          lobby.gamemode,
        );
      }),
    );

    return mappedLobbiesArray;
  }
}
