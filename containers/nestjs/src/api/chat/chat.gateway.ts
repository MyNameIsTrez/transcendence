import { ValidationPipe, UsePipes, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'http';
import { ChatService } from '../../chat/chat.service';
import { IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';
import { BadRequestTransformFilter } from '../../bad-request-transform.filter';
import TransJwtService from '../../auth/trans-jwt-service';
import { UserService } from '../../user/user.service';
import { Visibility } from '../../chat/chat.entity';

class ChatDto {
  @IsUUID()
  chatId: string;

  @ValidateIf((x) => x.visibility === Visibility.PROTECTED)
  @IsNotEmpty()
  password: string | null;
}

class HandleMessageDto {
  @IsUUID()
  chatId: string;

  @IsNotEmpty()
  body: string;
}

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
@UseFilters(BadRequestTransformFilter)
@UsePipes(new ValidationPipe())
export class ChatGateway {
  // TODO: Add send and receive message db logic and socket endpoints
  @WebSocketServer()
  server!: Server;

  private chatToSockets = new Map<string, Set<Socket>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly transJwtService: TransJwtService,
  ) {}

  handleConnection(@ConnectedSocket() client: Socket) {
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
    }

    const jwt = authorization.split(' ')[1];

    try {
      const decoded = this.transJwtService.verify(jwt);
      client.data.intra_id = decoded.sub;
    } catch (e) {
      console.error('Disconnecting client, because verifying their jwt failed');
      client.emit('exception', {
        errorMessage: 'Verifying jwt failed',
        redirectToLoginPage: true,
      });
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.chatToSockets.forEach((sockets, chatId) => {
      if (sockets.has(client)) {
        sockets.delete(client);
      }

      if (sockets.size <= 0) {
        this.chatToSockets.delete(chatId);
      }
    });

    // console.log(
    //   'In handleDisconnect(), this.chatToSockets is',
    //   this.chatToSockets,
    // );
  }

  @SubscribeMessage('joinChat')
  async joinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ChatDto,
  ) {
    if (!this.chatToSockets.has(dto.chatId)) {
      this.chatToSockets.set(dto.chatId, new Set());
    }

    const sockets = this.chatToSockets.get(dto.chatId);

    sockets.add(client);

    // TODO: We don't need to add ourselves if we're already in it
    await this.chatService.addUser(dto.chatId, client.data.intra_id);

    return {};
  }

  @SubscribeMessage('leaveChat')
  async leaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ChatDto,
  ) {
    const sockets = this.chatToSockets.get(dto.chatId);

    if (sockets) {
      sockets.delete(client);
    }

    if (sockets.size <= 0) {
      this.chatToSockets.delete(dto.chatId);
    }

    // console.log('In leaveChat(), this.chatToSockets is', this.chatToSockets);

    return {};
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: HandleMessageDto,
  ) {
    // TODO: Move some of these checks to joinChat()?
    if (await this.chatService.isMute(dto.chatId, client.data.intra_id)) {
      // TODO: Ideally this string would tell the user how long they're still muted for
      throw new WsException("You're currently muted in this chat");
    }
    if (await this.chatService.isBanned(dto.chatId, client.data.intra_id)) {
      throw new WsException("You're banned from this chat");
    }
    if (!(await this.chatService.isUser(dto.chatId, client.data.intra_id))) {
      throw new WsException("You're not a user of this chat");
    }

    await this.chatService.handleMessage(
      client.data.intra_id,
      dto.chatId,
      dto.body,
    );

    const sockets = this.chatToSockets.get(dto.chatId) ?? [];

    const senderName = await this.userService.getUsername(client.data.intra_id);

    sockets.forEach((otherClient) => {
      otherClient.emit('newMessage', {
        sender: client.data.intra_id,
        sender_name: senderName,
        body: dto.body,
      });
    });

    return {};
  }
}
