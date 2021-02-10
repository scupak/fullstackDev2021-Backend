import { Injectable } from '@nestjs/common';
import { ChatClient } from './chat-client.model';
import { ChatMessage } from './chat-message.model';
import { MessageDTO } from './MessageDTO';
import SocketIO, { Socket } from 'socket.io';
@Injectable()
export class ChatService {
  allMessages: ChatMessage[] = [];
  clients: ChatClient[] = [];
  typingClients: ChatClient[] = [];

  addMessage(message: MessageDTO, clientId: string): ChatMessage {
    const client = this.clients.find((c) => c.id === clientId);
    const chatMessage: ChatMessage = { message: message, sender: client };
    this.allMessages.push(chatMessage);
    return chatMessage;
  }

  addClient(id: string, nickname: string): ChatClient {
    let chatClient = this.clients.find((c) => c.nickname === nickname && c.id === id);

    if(chatClient){
      return chatClient;
    }
    if(this.clients.find((c) => c.nickname === nickname)){
      throw new Error('Nickname already used');
    }
    chatClient = { id: id, nickname: nickname };
    this.clients.push(chatClient);
    return chatClient;
  }

  getClients(): ChatClient[] {
    return this.clients;
  }

  getMessages(): ChatMessage[] {
    return this.allMessages;
  }

  deleteClient(id: string): void {
    this.typingClients = this.typingClients.filter((c) => c.id !== id);
    this.clients = this.clients.filter((c) => c.id !== id);
  }

  typing(typing: boolean, client: Socket): ChatClient[] {
    const chatClient = this.clients.find((c) => c.id == client.id);
    if (typing) {
      if (!this.typingClients.find((c) => c.id == client.id)) {
        this.typingClients.push(chatClient);
        return this.typingClients;
      } else {
        return this.typingClients;
      }
    } else {
      if (this.typingClients.find((c) => c.id == client.id)){
        this.typingClients = this.typingClients.filter(
          (c) => c.id !== client.id,
        );
        return this.typingClients;
      } else {
        return this.typingClients;
      }
    }
  }
}
