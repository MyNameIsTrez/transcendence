import { Server, Socket } from 'socket.io';
import Lobby from './Lobby';

export default class LobbyManager {
  private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<
    Lobby['id'],
    Lobby
  >();

  private readonly updateIntervalMs = 1000;

  constructor(private readonly server: Server) {}

  public queue(client: Socket) {
    // TODO: Throw an error if the client is already in a different lobby
    const lobby = this.getLobby();
    lobby.addClient(client);
    this.lobbies.set(lobby.id, lobby);
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
      console.log('Found a not full lobby');
      return notFullLobby;
    }

    const newLobby = new Lobby(this.server);
    this.lobbies.set(newLobby.id, newLobby);
    console.log('Created a new lobby');
    return newLobby;
  }

  // TODO: Use this to join private lobbies
  // public join(lobby_id: string) {}

  public updateLoop() {
    setInterval(() => {
      console.log('In LobbyManager its updateLoop()');
      this.lobbies.forEach((lobby) => {
        lobby.emit('game', 'foo');
      });
    }, this.updateIntervalMs);
  }
}
