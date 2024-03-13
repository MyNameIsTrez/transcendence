import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { Server } from 'http'
import { AppService } from './app.service'

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {
  // TODO: The gateway is maybe not supposed to call AppServices?
  constructor(private readonly appService: AppService) {}

  @WebSocketServer()
  server!: Server

  @SubscribeMessage('code')
  async code(@ConnectedSocket() client: Socket, @MessageBody('code') code: string) {
    const success = await this.appService.authenticate(code)
    client.emit('attemptLogin', success)
  }
}
