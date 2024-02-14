import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
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
  server!: Server;

  pong = new Pong();

  player1: Socket | null = null;
  player2: Socket | null = null;

  handleConnection(client: Socket) {
    console.log('Handle connection called');
    if (this.player1 == null) {
      this.player1 = client;
      console.log('Player 1 joined');
      if (this.player2 != null) {
        this.player2.emit('opponentDisconnected', 0);
      }
    } else if (this.player2 == null) {
      this.player2 = client;
      console.log('Player 2 joined');
      if (this.player1 != null) {
        this.player1.emit('opponentDisconnected', 0);
      }
    } else {
      console.log('A third player tried to join!');
    }

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
    if (this.player1 != null && client.id == this.player1.id) {
      this.player1 = null;
      console.log(`Player 1 disconnected`);
      if (this.player2 != null) {
        this.player2.emit('opponentDisconnected', 1);
      }
    } else if (this.player2 != null && client.id == this.player2.id) {
      this.player2 = null;
      console.log(`Player 2 disconnected`);
      if (this.player1 != null) {
        this.player1.emit('opponentDisconnected', 1);
      }
    } else {
      console.log('Another client disconnected');
    }
    if (this.player1 == null && this.player2 == null) {
      this.pong.resetGame();
      console.log(`Game has been reset`);
    }
  }

  afterInit() {
    const interval_ms = 1000 / 60;
    this.pong.resetGame();
    setInterval(() => {
      // TODO: I don't think this is a good way to wait for both players to connect, see if there is a better way later. -Victor
      if (this.player1 != null && this.player2 != null) {
        this.pong.update();
        const data = this.pong.getData();
        this.player1?.emit('pong', data);
        this.player2?.emit('pong', data);
      }
    }, interval_ms);
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @SubscribeMessage('pressed')
  async pressed(
    @ConnectedSocket() client: Socket,
    @MessageBody() keyName: string,
  ) {
    const isPlayer1 = client.id === this.player1?.id;
    const isPlayer2 = client.id === this.player2?.id;

    if (isPlayer1) {
      this.pong.clientPressedKey(keyName, this.pong._leftPlayer);
    } else if (isPlayer2) {
      this.pong.clientPressedKey(keyName, this.pong._rightPlayer);
    }
  }

  @SubscribeMessage('released')
  async released(
    @ConnectedSocket() client: Socket,
    @MessageBody() keyName: string,
  ) {
    const isPlayer1 = client.id === this.player1?.id;
    const isPlayer2 = client.id === this.player2?.id;

    if (isPlayer1) {
      this.pong.clientReleasedKey(keyName, this.pong._leftPlayer);
    } else if (isPlayer2) {
      this.pong.clientReleasedKey(keyName, this.pong._rightPlayer);
    }
  }
}
