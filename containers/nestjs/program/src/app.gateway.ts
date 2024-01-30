import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'http';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  clients = new Set<Socket>();

  handleConnection(client: Socket) {
    this.clients.add(client);
    // this.broadcast('events', 'A player connected');
    // console.log('Client connected');

    // TODO: This can be used, but will need a condition to exit,
    // when the client disconnects
    // let i = 0;
    // const interval_ms = 1000;
    // setInterval(() => {
    //   client.emit('increment', i);
    //   i++;
    // }, interval_ms);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
    this.broadcast('events', 'A player disconnected');
    // console.log('Client disconnected');
  }

  private broadcast(event: string, message: string) {
    this.clients.forEach((client) => {
      client.emit(event, message);
      // console.log('Sent message to client');
    });
  }

  afterInit() {
    let i = 0;
    const interval_ms = 1000 / 60;
    setInterval(() => {
      this.broadcast('increment', i.toString());
      i++;
    }, interval_ms);
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
