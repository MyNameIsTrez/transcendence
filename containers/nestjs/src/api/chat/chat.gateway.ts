import {
  ValidationPipe,
  UsePipes,
  UseFilters,
  Injectable,
} from '@nestjs/common';
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
import {
  IsEnum,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BadRequestTransformFilter } from '../../bad-request-transform.filter';
import TransJwtService from '../../auth/trans-jwt-service';
import { UserService } from '../../user/user.service';
import { Visibility } from '../../chat/chat.entity';
import { BaseEntity } from 'typeorm';
import { Transform, TransformFnParams } from 'class-transformer';
import ChatSockets from 'src/chat/chat.sockets';

@ValidatorConstraint({ async: true })
@Injectable()
export class PasswordConstraint implements ValidatorConstraintInterface {
  constructor(private readonly chatService: ChatService) {}

  async validate(
    password: string | undefined,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const dto = validationArguments.object as JoinChatDto;
    const chat = await this.chatService.getChat({ chat_id: dto.chatId });

    if (chat.visibility !== Visibility.PROTECTED) {
      return true;
    }

    if (!password) {
      throw new WsException('Password required for protected chat');
    }

    if (!(await this.chatService.isCorrectPassword(dto.chatId, password))) {
      throw new WsException('Incorrect password');
    }

    return true;
  }
}

class CreateDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(Visibility)
  visibility: Visibility;

  @ValidateIf((x) => x.visibility === Visibility.PROTECTED)
  @IsNotEmpty()
  password: string;
}

// TODO: Try to get rid of "extends BaseEntity"
class JoinChatDto extends BaseEntity {
  @IsUUID()
  chatId: string;

  @Validate(PasswordConstraint)
  password: string;
}

class ChatDto {
  @IsUUID()
  chatId: string;
}

class HandleMessageDto {
  @IsUUID()
  chatId: string;

  @MaxLength(2000, {
    message: 'Message is too long',
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
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

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly transJwtService: TransJwtService,
    private readonly chatSockets: ChatSockets,
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

    this.chatSockets.add(client);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.chatSockets.disconnect(client);
  }

  @SubscribeMessage('create')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateDto,
  ) {
    const chat = await this.chatService.create(
      client.data.intra_id,
      dto.name,
      dto.visibility,
      dto.password,
    );

    const sentChat = {
      chat_id: chat.chat_id,
      name: chat.name,
      visibility: chat.visibility,
    };

    client.emit('addMyChat', sentChat);

    if (chat.visibility !== Visibility.PRIVATE) {
      this.chatSockets.emitToAllSockets('addChat', sentChat);
    }

    return sentChat;
  }

  @SubscribeMessage('joinChat')
  async joinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinChatDto,
  ) {
    // Throws if the user was already in the chat
    await this.chatService.addUser(dto.chatId, client.data.intra_id);

    return {};
  }

  @SubscribeMessage('openChat')
  async openChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ChatDto,
  ) {
    this.chatSockets.addToChat(dto.chatId, client);

    await this.chatService.openChat(dto.chatId, client.data.intra_id);

    return {};
  }

  @SubscribeMessage('closeChat')
  async closeChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ChatDto,
  ) {
    this.chatSockets.removeFromChat(dto.chatId, client);

    return {};
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: HandleMessageDto,
  ) {
    // TODO: Move some of these checks to joinChat()?
    if (await this.chatService.isMuted(dto.chatId, client.data.intra_id)) {
      // TODO: Ideally this string would tell the user how long they're still muted for
      throw new WsException("You're currently muted in this chat");
    }
    if (await this.chatService.isBanned(dto.chatId, client.data.intra_id)) {
      throw new WsException("You're banned from this chat");
    }
    if (!(await this.chatService.isUser(dto.chatId, client.data.intra_id))) {
      throw new WsException("You're not a user of this chat");
    }

    const date = new Date();

    const body = dto.body.trim();

    await this.chatService.handleMessage(
      client.data.intra_id,
      dto.chatId,
      body,
      date,
    );

    this.chatSockets.emitToChat(dto.chatId, 'newMessage', {
      sender: client.data.intra_id,
      sender_name: await this.userService.getUsername(client.data.intra_id),
      body,
      date: date,
    });

    return {};
  }
}
