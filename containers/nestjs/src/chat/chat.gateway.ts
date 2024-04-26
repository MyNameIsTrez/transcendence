import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'http';

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway {
  // TODO: Add send and receive message db logic and socket endpoints
  @WebSocketServer()
  server!: Server

  public connectedClients = new Set<string>();
  
  constructor() {}

  handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		this.connectedClients.add(client.id);
		this.sendConnectedClients();
		// this.sendChatHistory(client);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		this.connectedClients.delete(client.id);
		this.sendConnectedClients();
	}

	sendConnectedClients() {
		this.server.emit('connectedClients', Array.from(this.connectedClients));
	}

  // @SubscribeMessage('sendMessage')
  // handleMessage(client: Socket, message: {sender: string, chatName: string, body: string}): void {
    
  // }

}
