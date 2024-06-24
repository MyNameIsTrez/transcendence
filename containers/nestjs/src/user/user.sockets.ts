import { Socket } from 'socket.io';

export default class UserSockets {
  private readonly clients = new Map<number, Socket[]>();

  public add(client: Socket) {
    const intra_id = client.data.intra_id;

    let sockets = this.clients.get(intra_id);
    if (!sockets) {
      sockets = [];
      this.clients.set(intra_id, sockets);
    }

    sockets.push(client);
  }

  public remove(client: Socket) {
    const intra_id = client.data.intra_id;

    const clientSockets = this.clients.get(intra_id);
    const index = clientSockets.indexOf(client);
    if (index > -1) {
      clientSockets.splice(index, 1);
    }

    if (clientSockets.length === 0) {
      this.clients.delete(intra_id);
    }
  }

  public get(intra_id: number): Socket[] {
    return this.clients.get(intra_id) ?? [];
  }
}
