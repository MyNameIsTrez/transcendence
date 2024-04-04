import {
  // ConnectedSocket,
  // MessageBody,
  // SubscribeMessage,
  WebSocketGateway,
  // WebSocketServer,
} from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { JwtService } from '@nestjs/jwt';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway {
  // constructor(private jwtService: JwtService) {}
  // @WebSocketServer()
  // server: Server;
  // handleConnection(client: Socket) {
  //   console.log('in chat');
  //   console.log('client.id in handleConnection():', client.id);
  //   console.log('Client connected');
  //   const authorization = client.handshake.headers.authorization;
  //   const jwt = authorization.split(' ')[1];
  //   try {
  //     this.jwtService.verify(jwt);
  //   } catch (e) {
  //     console.error('Disconnecting client because verifying their jwt failed');
  //     client.disconnect();
  //   }
  // }
  // handleDisconnect(client: Socket) {
  //   console.log(`Client disconnected in chat: ${client.id}`);
  // }
  // @SubscribeMessage('joinRoom')
  // async joinRoom(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody('room_uuid') room_uuid: string,
  // ) {
  //   console.log(
  //     `client ${client.id} in joinRoom() joining room with uuid ${room_uuid}`,
  //   );
  //   client.join(room_uuid);
  // }
  // // TODO: Let this call joinRoom() in a loop?
  // // @SubscribeMessage('joinRooms')
  // // async joinRooms(@ConnectedSocket() client: Socket) {
  // //   console.log(`client ${client.id} in joinRooms()`);
  // //   client.join('foo'); // TODO: Randomly generated ID?
  // // }
  // @SubscribeMessage('message')
  // async message(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody('room_uuid') room_uuid: string,
  //   @MessageBody('message') message: string,
  // ) {
  //   console.log(
  //     `client ${client.id} in message() in room with uuid ${room_uuid}, sending message '${message}'`,
  //   );
  //   this.server.to(room_uuid).emit('foo', message);
  // }
}
