import { ValidationPipe, UsePipes, UseFilters } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'http';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { IsNotEmpty } from 'class-validator';
import { BadRequestTransformFilter } from '../bad-request-transform.filter';

class HandleMessageDto {
	@IsNotEmpty()
	chatId: string;

	@IsNotEmpty()
	body: string;
}

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
@UseFilters(BadRequestTransformFilter)
export class ChatGateway {
	// TODO: Add send and receive message db logic and socket endpoints
	@WebSocketServer()
	server!: Server

	public connectedClients = new Set<string>();

	constructor(private readonly chatService: ChatService, private jwtService: JwtService) { }

	handleConnection(client: Socket) {
		console.log(`Client ${client.id} connected to chat socket`);

		const authorization = client.handshake.headers.authorization;
		if (!authorization) {
			console.error(
				'Disconnecting client, because they had no authorization header',
			);
			client.emit('exception', {
				errorMessage: 'Missing the authorization header',
				redirectToLoginPage: true,
			});
			return;

			// Ideally we'd throw an exception, but it seems to always crash handleConnection()
			// client.disconnect();
			// throw new WsException(
			//   'Disconnecting client, because they had no authorization header',
			// );
		}

		const jwt = authorization.split(' ')[1];

		try {
			const decoded = this.jwtService.verify(jwt);
			client.data.intra_id = decoded.sub;
		} catch (e) {
			console.error('Disconnecting client, because verifying their jwt failed');
			client.emit('exception', {
				errorMessage: 'Verifying jwt failed',
				redirectToLoginPage: true,
			});
		}

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

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('sendMessage')
	// handleMessage(client: Socket, message: { chatId: string, body: string }): void {
	handleMessage(client: Socket, @MessageBody() dto: HandleMessageDto) {
		console.log(dto)
		this.chatService.handleMessage(client.data.intra_id, dto.chatId, dto.body)
	}
}
