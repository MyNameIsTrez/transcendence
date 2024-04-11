import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import Pong from './pong';

export default class Lobby {
  public readonly id: string = uuidv4();

  private readonly maxClients = 2;

  private readonly clients = new Map<Socket['id'], Socket>();

  private readonly pong = new Pong(10);

  private gameHasStarted = false;

  constructor(private readonly server: Server) {}

  public addClient(client: Socket) {
    console.log(
      `In Lobby ${this.id} its addClient(), client ${client.id} was added`,
    );
    client.data.playerIndex = this.clients.size;
    this.clients.set(client.id, client);
    client.join(this.id);

    // TODO: Start the game only once both players have pressed a "Ready" button
    if (this.isFull()) {
      this.gameHasStarted = true;
      this.emit('gameStart');
    }
  }

  public removeClient(client: Socket) {
    console.log(
      `In Lobby ${this.id} its removeClient(), client ${client.id} was removed`,
    );
    this.clients.delete(client.id);
    client.leave(this.id);
    client.data.lobby = undefined;
  }

  public hasClient(client: Socket) {
    return this.clients.has(client.id);
  }

  public isFull() {
    return this.clients.size >= this.maxClients;
  }

  public isEmpty() {
    return this.clients.size == 0;
  }

  public update() {
    if (!this.gameHasStarted) {
      return;
    }

    this.pong.update();

    this.emit('pong', this.pong.getData());

    if (this.pong.didSomeoneWin()) {
      const winnerIndex = this.pong.getWinnerIndex();

      this.clients.forEach((client) => {
        client.emit('gameOver', client.data.playerIndex === winnerIndex);
      });
    }
  }

  public didSomeoneWin() {
    return this.pong.didSomeoneWin();
  }

  public disconnectClients() {
    this.clients.forEach((client) => {
      this.removeClient(client);
    });
  }

  private emit(event: string, payload?: any) {
    console.log(
      `In Lobby ${this.id} its emit(), emitting to ${this.clients.size} clients`,
    );
    this.server.to(this.id).emit(event, payload);
  }

  public movePaddle(client: Socket, keydown: boolean, north: boolean) {
    if (!this.gameHasStarted) {
      return;
    }

    this.pong.movePaddle(client.data.playerIndex, keydown, north);
  }
}
