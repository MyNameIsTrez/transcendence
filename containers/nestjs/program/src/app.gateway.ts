import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'http';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  clients = new Set<Socket>();

  handleConnection(client: Socket) {
    this.clients.add(client);
    this.broadcast('events', 'A player connected');
    console.log('Client connected');
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
    this.broadcast('events', 'A player disconnected');
    console.log('Client disconnected');
  }

  private broadcast(event: string, message: string) {
    this.clients.forEach((client) => {
      client.emit(event, message);
      // console.log(client);
      console.log('Sent message to client');
    });
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
