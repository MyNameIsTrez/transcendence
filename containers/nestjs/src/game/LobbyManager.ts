import { Server, Socket } from 'socket.io';
import Lobby from './Lobby';
import { WsException } from '@nestjs/websockets';

export default class LobbyManager {
  private readonly lobbies = new Map<Lobby['id'], Lobby>();

  private readonly updateIntervalMs = 1000 / 60;

  constructor(private readonly server: Server) {}

  public queue(client: Socket) {
    if (this.isClientAlreadyInLobby(client)) {
      console.error(`Client ${client.id} is already in a lobby`);
      throw new WsException('Already in a lobby');
    }

    const lobby = this.getLobby();
    lobby.addClient(client);
    this.lobbies.set(lobby.id, lobby);
    client.data.lobby = lobby;
  }

  // TODO: Also throw if the same intra account is in different lobbies?
  private isClientAlreadyInLobby(client: Socket): boolean {
    return Array.from(this.lobbies.values()).some((lobby) =>
      lobby.hasClient(client),
    );
  }

  // Looping through all lobbies is theoretically inefficient,
  // but we can't just use the old approach of using an array
  // and checking if the last lobby only has 1 player.
  // This is because join() could accidentally join the wrong lobby
  // if it took a lobby_index instead of a lobby_id.
  private getLobby(): Lobby {
    const notFullLobby = Array.from(this.lobbies.values()).find(
      (lobby) => !lobby.isFull(),
    );
    if (notFullLobby) {
      console.log("Found a lobby that wasn't full");
      return notFullLobby;
    }

    const newLobby = new Lobby(this.server);
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
