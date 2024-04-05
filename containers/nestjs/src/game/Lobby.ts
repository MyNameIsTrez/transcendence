import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export default class Lobby {
  public readonly id: string = uuidv4();

  private readonly maxClients = 2;

  private readonly clients = new Array<Socket>();

  constructor(private readonly server: Server) {}

  public addClient(client: Socket) {
    console.log(
      `In Lobby ${this.id} its addClient(), client ${client.id} got added`,
    );
    this.clients.push(client);
    client.join(this.id);
  }

  public isFull() {
    return this.clients.length >= this.maxClients;
  }

  public emit(event: string, payload: any) {
    console.log(`In Lobby ${this.id} its emit()`);
    this.server.to(this.id).emit(event, payload);
  }
}
