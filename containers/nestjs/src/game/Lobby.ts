import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import Pong from './pong';

export default class Lobby {
  public readonly id: string = uuid();

  private readonly maxClients = 2;

  // TODO: Could maybe be deleted and be replaced with an Array?
  // 'any' is client.data.intra_id struct
  private readonly clients = new Map<number, Socket>();

  private readonly pong = new Pong(10);

  private gameHasStarted = false;

  constructor(private readonly server: Server) {}

  public addClient(client: Socket) {
    // console.log(
    //   `In Lobby ${this.id} its addClient(), user ${client.data.intra_id} was added`,
    // );
    client.data.playerIndex = this.clients.size;
    // console.log('Adding user', client.data);
    this.clients.set(client.data.intra_id, client);
    client.join(this.id);

    // TODO: Maybe add a countdown when game starts?
    if (this.isFull()) {
      this.gameHasStarted = true;
      this.emit('gameStart');
    }
  }

  public removeClient(client: Socket) {
    // console.log(
    //   `In Lobby ${this.id} its removeClient(), user ${client.data.intra_id} was removed`,
    // );
    this.clients.delete(client.data.intra_id);
    client.leave(this.id);
    client.data.lobby = undefined;
  }

  public hasUser(user: any) {
    return this.clients.has(user.intra_id);
  }

  public isFull() {
    return this.clients.size >= this.maxClients;
  }

  public update() {
    // console.log(this.clients.size);
    if (!this.gameHasStarted) {
      return;
    }
    // console.log('In game loop');

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

  public emit(event: string, payload?: any) {
    // console.log(
    //   `In Lobby ${this.id} its emit(), emitting to ${this.clients.size} clients`,
    // );
    this.server.to(this.id).emit(event, payload);
  }

  public movePaddle(playerIndex: number, keydown: boolean, north: boolean) {
    if (!this.gameHasStarted) {
      return;
    }

    this.pong.movePaddle(playerIndex, keydown, north);
  }
}
