import { Socket } from 'socket.io';

export default class ChatSockets {
  private readonly connectedClients = new Set<Socket>();
  private readonly clientToSockets = new Map<number, Set<Socket>>();
  private readonly chatToSockets = new Map<string, Set<Socket>>();

  public add(client: Socket) {
    this.connectedClients.add(client);

    const intra_id = client.data.intra_id;
    let sockets = this.clientToSockets.get(intra_id);
    if (!sockets) {
      sockets = new Set();
      this.clientToSockets.set(intra_id, sockets);
    }
    sockets.add(client);
  }

  public addToChat(chatId: string, client: Socket) {
    let sockets = this.chatToSockets.get(chatId);
    if (!sockets) {
      sockets = new Set();
      this.chatToSockets.set(chatId, sockets);
    }
    sockets.add(client);
  }

  public removeFromChat(chatId: string, client: Socket) {
    let sockets = this.chatToSockets.get(chatId);
    if (sockets) {
      sockets.delete(client);
      if (sockets.size <= 0) {
        this.chatToSockets.delete(chatId);
      }
    }
  }

  public disconnect(client: Socket) {
    this.connectedClients.delete(client);

    const intra_id = client.data.intra_id;
    const clientSockets = this.clientToSockets.get(intra_id);
    if (clientSockets) {
      clientSockets.delete(client);
      if (clientSockets.size <= 0) {
        this.clientToSockets.delete(intra_id);
      }
    }

    this.chatToSockets.forEach((_sockets, chatId) => {
      this.removeFromChat(chatId, client);
    });
  }

  //   public get(intra_id: number): Socket[] {
  //     return this.clients.get(intra_id) ?? [];
  //   }

  //   public getAll(): Socket[] {
  //     return this.clients;
  //   }

  public emitToAllSockets(event: string, body: any) {
    for (const socket of this.connectedClients.values()) {
      socket.emit(event, body);
    }
  }

  public emitToChat(chatId: string, event: string, body: any) {
    const sockets = this.chatToSockets.get(chatId);

    if (sockets) {
      sockets.forEach((otherClient) => {
        otherClient.emit(event, body);
      });
    }
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
