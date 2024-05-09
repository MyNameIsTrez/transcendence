import { Server, Socket } from 'socket.io';
import Lobby from './Lobby';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';

export default class LobbyManager {
  private readonly lobbies = new Map<Lobby['id'], Lobby>();

  private readonly updateIntervalMs = 1000 / 60;

  constructor(
    private readonly server: Server,
    private configService: ConfigService,
  ) {}

  public queue(client: Socket, mode: string) {
    if (
      this.isUserAlreadyInLobby(client.data) &&
      this.configService.get('DEBUG') == 0
    ) {
      console.error(`User ${client.data.intra_id} is already in a lobby`);
      throw new WsException('Already in a lobby');
    }

    const lobby = this.getLobby(mode);
    lobby.addClient(client);
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
    // TODO: Update this to look for corrrect gamemode lobby
    const notFullLobby = Array.from(this.lobbies.values()).find(
      (lobby) => lobby.getPong().type === mode && !lobby.isFull(),
    );
    if (notFullLobby) {
      console.log("Found a lobby that wasn't full");
      return notFullLobby;
    }

    const newLobby = new Lobby(mode, this.server, this.configService);
    this.lobbies.set(newLobby.id, newLobby);
    console.log('Created a new lobby');
    return newLobby;
  }

  // TODO: Use this to join private lobbies
  // public join(lobby_id: string) {}

  public removeClient(client: Socket) {
    const lobby: Lobby | undefined = client.data.lobby;

    if (lobby) {
      lobby.removeClient(client);

      // If one of the clients disconnects, the other client wins
      lobby.emit('gameOver', true);

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
