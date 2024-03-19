// import { Controller, Get, Post, Body } from '@nestjs/common';
// import { ChatService } from './chat.service';
// import { AppGateway } from '../app.gateway'; // Add this import

// @Controller('api/messages')
// export class ChatController {
//   constructor(
//     private readonly chatService: ChatService,
//     private readonly appGateway: AppGateway, // Add AppGateway to constructor
//   ) {}

//   @Post()
//   async sendMessage(@Body() message: { content: string }): Promise<any> {
//     const savedMessage = await this.chatService.saveMessage(message.content);
//     this.appGateway.server.emit('newMessage', savedMessage); // Broadcast the saved message to all connected clients
//     return savedMessage;
//   }
// }

// chat.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('api/messages')
export class ChatController {
  constructor(private readonly appGateway: ChatGateway) {}

  @Post()
  async sendMessage(@Body() message: { content: string, sender: string, recipient: string }): Promise<any> {
    // this.appGateway.server.to(message.recipient).emit('newMessage', message); // Broadcast the message to the recipient
    // return message;
  }
}