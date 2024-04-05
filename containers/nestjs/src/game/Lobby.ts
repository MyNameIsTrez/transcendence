import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export default class Lobby {
  public readonly id: string = uuidv4();

  private readonly maxClients = 2;

  public readonly clients = new Map<Socket['id'], Socket>();

  constructor(private readonly server: Server) {}

  public addClient(client: Socket) {
    console.log(
      `In Lobby ${this.id} its addClient(), client ${client.id} got added`,
    );
    this.clients.set(client.id, client);
    client.join(this.id);
  }

  public isFull() {
    return this.clients.size >= this.maxClients;
  }

  public update() {
    this.emit('game', 'foo');
  }

  private emit(event: string, payload: any) {
    console.log(
      `In Lobby ${this.id} its emit(), emitting to ${this.clients.size} clients`,
    );
    this.server.to(this.id).emit(event, payload);
  }
}
