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
import { Pong } from './pong';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	clients = new Set<Socket>();

	pong = new Pong();
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

  private broadcast(event: string, message: any) {
    this.clients.forEach((client) => {
      client.emit(event, message);
      // console.log('Sent message to client');
    });
  }

  afterInit() {
    const interval_ms = 1000 / 60;
    this.pong.start();
    setInterval(() => {
      this.pong.update();
      this.broadcast('pong', this.pong._data);
    }, interval_ms);
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @SubscribeMessage('pressed')
  async pressed(@MessageBody() keyName: string) {
	this.pong.clientPressedKey(keyName)
  }

  @SubscribeMessage('released')
  async released(@MessageBody() keyName: string) {
	this.pong.clientReleasedKey(keyName)
  }
}
