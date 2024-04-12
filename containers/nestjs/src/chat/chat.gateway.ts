import { WebSocketGateway } from '@nestjs/websockets';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway {
  // TODO: Add send and receive message db logic and socket endpoints
}
