import { 
	SubscribeMessage, 
	WebSocketGateway, 
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import * as fs from 'fs';

// port 8001 is the port the back end is serving on
// {cors: '*'} makes sure it's accepts every front end connection
@WebSocketGateway(8001, { cors: '*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	public	connectedClients = new Set<string>();

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		this.connectedClients.add(client.id);
		this.sendConnectedClients();

	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		this.connectedClients.delete(client.id);
    	this.sendConnectedClients();
	}

	sendConnectedClients() {
		this.server.emit('connectedClients', Array.from(this.connectedClients));
	}

	@SubscribeMessage('sendMessage')
	handleMessage(client: Socket, message: { content: string, recipient: string }): void {

		fs.appendFileSync('./data/chat_history.txt', '\n' + client.id + ': ' + message.content);

		const chatHistory = fs.readFileSync('./data/chat_history.txt', 'utf-8');

		let iterator = 0;

		while (iterator < chatHistory.length) {
			let currentCharacter = chatHistory[iterator];
			let accumulatedString = '';

			while (currentCharacter !== '\n' && iterator < chatHistory.length) {
			accumulatedString += currentCharacter;
			iterator++;

			if (iterator < chatHistory.length) {
				currentCharacter = chatHistory[iterator];
			}
			}

			if (accumulatedString.length > 0) {
				const messageToVue = {content: accumulatedString, recipient: message.recipient};
				this.server.to(client.id).to(message.recipient).emit('newMessage', messageToVue);	
			}

			if (currentCharacter === '\n') {
			iterator++;
			}
		}
		
	}
}

