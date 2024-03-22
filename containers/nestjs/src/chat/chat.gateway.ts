import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';

import { Controller, Post, Body , Get, Query} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';
import { ChatModule } from './chat.module';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway {
	@WebSocketServer()
	server!: Server

	public connectedClients = new Set<string>();

	// new 
	private chatChannels: Map<string, string[]> = new Map();

	constructor() {
		this.chatChannels.set('general', ['lvan-bus', 'sbos', 'first_channel']);
	}

	getChatMessages(channelName: string): string[] | undefined {
		return this.chatChannels.get(channelName);
	}
	// till here

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

// also new
// chat.controller.ts
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatGateway) {}

  @Get('messages')
  getChatMessages(@Query('channelName') channelName: string): string[] | { error: string } {
    const messages = this.chatService.getChatMessages(channelName);
    if (messages) {
      return messages;
    } else {
      return { error: 'Chat channel not found' };
    }
  }
}

