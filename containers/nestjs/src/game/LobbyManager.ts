import { Server, Socket } from 'socket.io';
import Lobby from './Lobby';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MatchService } from '../users/match.service';

export default class LobbyManager {
  private readonly lobbies = new Map<Lobby['id'], Lobby>();

  private readonly updateIntervalMs = 1000 / 60;

  constructor(
    private readonly server: Server,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly matchService: MatchService,
  ) {}

  public async queue(client: Socket, mode: string) {
    if (
      this.isUserAlreadyInLobby(client.data) &&
      this.configService.get('DEBUG') == 0
    ) {
      console.error(`User ${client.data.intra_id} is already in a lobby`);
      throw new WsException('Already in a lobby');
    }

    const lobby = this.getLobby(mode);
    await lobby.addClient(client);
    this.lobbies.set(lobby.id, lobby);
    client.data.lobby = lobby;
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
  private getLobby(mode: string): Lobby {
    // TODO: Update this to look for the correct gamemode lobby
    const notFullLobby = Array.from(this.lobbies.values()).find(
      (lobby) => lobby.pong.type === mode && !lobby.isFull(),
    );
    if (notFullLobby) {
      console.log("Found a lobby that wasn't full");
      return notFullLobby;
    }

    const newLobby = new Lobby(
      mode,
      this.server,
      this.configService,
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
      this.usersService.addLoss(client.data.intra_id);

      lobby.removeClient(client);

      // If one of the clients disconnects, the other client wins
      lobby.emit('gameOver', true);

      lobby.clients.forEach((otherClient) => {
        this.usersService.addWin(otherClient.data.intra_id);
      });

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
