import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './shared/chat.service';
import { WelcomeDto } from './shared/welcome.dto';
import * as moment from 'moment';
import { MessageDTO } from './shared/MessageDTO';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}

  @WebSocketServer() server;

  @SubscribeMessage('message')
  async handleChatEvent(
    @MessageBody() message: MessageDTO,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const chatMessage = await this.chatService.addMessage(message, client.id);
    this.server.emit('newMessage', chatMessage);
  }

  @SubscribeMessage('typing')
  async handleTypingEvent(
    @MessageBody() typing: boolean,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const clientlist = this.chatService.typing(typing, client);
    this.server.emit('typing', clientlist);
  }

  @SubscribeMessage('nickname')
  async handleNicknameEvent(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const chatClient = await this.chatService.addClient(client.id, nickname);
      const chatClients = await this.chatService.getClients();
      const messages = await this.chatService.getMessages();
      console.log('chatClient', chatClient);
      const welcome: WelcomeDto = {
        clients: chatClients,
        messages: messages,
        client: chatClient,
      };
      client.emit('welcome', welcome);
      this.server.emit('clients', chatClients);
      this.server.emit('typing', this.chatService.typingClients);
    } catch (e) {
      client.error(e.message);
    }
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    client.emit('allMessages', this.chatService.getMessages());
    this.server.emit('clients', await this.chatService.getClients());
  }

  async handleDisconnect(client: Socket): Promise<any> {
    await this.chatService.deleteClient(client.id);
    this.server.emit('clients', this.chatService.getClients());
    this.server.emit('typing', this.chatService.typingClients);
  }
}
