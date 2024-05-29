import { Server, Socket } from 'socket.io';
import Lobby from './Lobby';
import PrivateLobby from './PrivateLobby';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../users/users.service';
import { MatchService } from '../users/match.service';
import { Gamemode } from '../users/match.entity';
import { User } from 'src/users/user.entity';
import { BadRequestException } from '@nestjs/common';

export default class LobbyManager {
  private readonly lobbies = new Map<Lobby['id'], Lobby>();

  private readonly updateIntervalMs = 1000 / 60;

  constructor(
    private readonly server: Server,
    private readonly usersService: UsersService,
    private readonly matchService: MatchService,
  ) {}

  public async queue(client: Socket, gamemode: Gamemode) {
    if (this.isUserAlreadyInLobby(client.data)) {
      console.error(`User ${client.data.intra_id} is already in a lobby`);
      throw new WsException({
        message: 'Already in a lobby',
        exitQueue: true,
      });
    }

    const lobby = this.getLobby(gamemode);
    await lobby.addClient(client);
    client.data.lobby = lobby;
  }

  public async createPrivateLobby(
    client: Socket,
    invitedIntraId: number,
    gamemode: Gamemode,
    clients: Map<number, Socket[]>,
  ) {
    if (this.isUserAlreadyInLobby(client.data)) {
      console.error(`User ${client.data.intra_id} is already in a lobby`);
      throw new WsException({
        message: 'Already in a lobby',
        exitQueue: true,
      });
    }

    if (!(await this.usersService.hasUser(invitedIntraId))) {
      throw new WsException({
        message: 'Could not find user',
        exitQueue: true,
      });
    }

    const lobby = new PrivateLobby(
      gamemode,
      true,
      this.server,
      this.usersService,
      this.matchService,
    );
    this.lobbies.set(lobby.id, lobby);
    await lobby.addClient(client);
    client.data.lobby = lobby;

    lobby.invitedIntraId = invitedIntraId;

    const clientSockets = clients.get(invitedIntraId);
    clientSockets.forEach((socket) => {
      socket.emit('invitation', {
        invitedBy: client.data.intra_id,
      });
    });
  }

  private isUserAlreadyInLobby(user: any): boolean {
    return Array.from(this.lobbies.values()).some((lobby) =>
      lobby.hasUser(user),
    );
  }

  // Looping through all lobbies is theoretically inefficient,
  // but we can't just use the old approach of using an array
  // and checking if the last lobby only has 1 player.
  // This is because join() could accidentally join the wrong lobby
  // if it took a lobby_index instead of a lobby_id.
  private getLobby(gamemode: Gamemode): Lobby {
    // TODO: Update this to look for the correct gamemode lobby
    const notFullLobby = Array.from(this.lobbies.values()).find(
      (lobby) =>
        lobby.pong.gamemode === gamemode && !lobby.isFull() && !lobby.isPrivate,
    );
    if (notFullLobby) {
      console.log("Found a lobby that wasn't full");
      return notFullLobby;
    }

    const newLobby = new Lobby(
      gamemode,
      false,
      this.server,
      this.usersService,
      this.matchService,
    );
    this.lobbies.set(newLobby.id, newLobby);
    console.log('Created a new lobby');
    return newLobby;
  }

  public async removeClient(client: Socket) {
    const lobby: Lobby | undefined = client.data.lobby;

    if (lobby) {
      // If a client disconnect while queueing, lobby.clients.size is 1
      const client_count = lobby.clients.size;

      if (client_count >= 2) {
        lobby.saveMatch(await this.usersService.findOne(client.data.intra_id));
        this.usersService.addLoss(client.data.intra_id);
      }

      lobby.removeClient(client);

      // If one of the clients disconnects, the other client wins
      lobby.emit('gameOver', true);

      if (client_count >= 2) {
        lobby.clients.forEach((otherClient) => {
          this.usersService.addWin(otherClient.data.intra_id);
        });
      }

      this.removeLobby(lobby);
    }
  }

  public updateLoop() {
    setInterval(() => {
      // console.log('In LobbyManager its updateLoop()');
      this.lobbies.forEach((lobby) => {
        lobby.update();
        if (lobby.didSomeoneWin()) {
          this.removeLobby(lobby);
        }
      });
    }, this.updateIntervalMs);
  }

  private removeLobby(lobby: Lobby) {
    lobby.disconnectClients();
    this.lobbies.delete(lobby.id);
  }
}
