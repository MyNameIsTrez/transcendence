import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'game' })
export class GameGateway {
  constructor(private jwtService: JwtService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('in game');

    console.log('client.id in handleConnection():', client.id);
    console.log('Client connected');

    const authorization = client.handshake.headers.authorization;
    if (!authorization) {
      console.error('Someone tried to connect without an authorization header');
      client.disconnect();
      return;
    }
    console.log('authorization', authorization);
    const jwt = authorization.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(jwt);
      client.data.intra_id = decoded.sub;
    } catch (e) {
      console.error('Disconnecting client because verifying their jwt failed');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected in game: ${client.id}`);
  }

  afterInit() {
    const interval_ms = 1000;
    setInterval(() => {
      this.server.emit('game', 'lmao');
    }, interval_ms);
  }

  @SubscribeMessage('joinGame')
  async joinGame(@ConnectedSocket() client: Socket) {
    console.log('client.id in game/joinGame():', client.id);
    console.log('Joining game');
  }
}
