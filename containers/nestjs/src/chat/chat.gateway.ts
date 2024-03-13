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
// @WebSocketGateway(8001, { cors: '*' })
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway {
	@WebSocketServer()
	server!: Server

	public connectedClients = new Set<string>();

	constructor() { }

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		this.connectedClients.add(client.id);
		this.sendConnectedClients();
		this.sendChatHistory(client);

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

		const messageToVue = { content: `${client.id}: ${message.content}`, recipient: message.recipient };
		this.sendChatHistory(client);
	}

	sendChatHistory(client: Socket) {
		try {
			const chatHistory = fs.readFileSync('./data/chat_history.txt', 'utf-8');
			const messageToVue = { content: chatHistory, recipient: client.id };
			client.emit('newMessage', messageToVue);
		} catch (error) {
			console.error('Error sending chat history:', error);
		}
	}

}

