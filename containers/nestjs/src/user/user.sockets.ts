import { Socket } from 'socket.io';

export default class UserSockets {
  private readonly clientToSockets = new Map<number, Socket[]>();

  public add(client: Socket) {
    const intra_id = client.data.intra_id;

    let sockets = this.clientToSockets.get(intra_id);
    if (!sockets) {
      sockets = [];
      this.clientToSockets.set(intra_id, sockets);
    }

    sockets.push(client);
  }

  public remove(client: Socket) {
    const intra_id = client.data.intra_id;

    const clientSockets = this.clientToSockets.get(intra_id);
    const index = clientSockets.indexOf(client);
    if (index > -1) {
      clientSockets.splice(index, 1);
    }

    if (clientSockets.length === 0) {
      this.clientToSockets.delete(intra_id);
    }
  }

  public get(intra_id: number): Socket[] {
    return this.clientToSockets.get(intra_id) ?? [];
  }

  public emitToClient(intra_id: number, event: string, body: any) {
    const sockets = this.clientToSockets.get(intra_id);

    if (sockets) {
      sockets.forEach((otherClient) => {
        otherClient.emit(event, body);
      });
    }
  }
}
