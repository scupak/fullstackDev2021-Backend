import { Injectable } from '@nestjs/common';
import { ChatClient } from './chat-client.model';

@Injectable()
export class ChatService {
  allMessages: string[] = [];
  clients: ChatClient[] = [];

  addMessage(message: string): void {
    this.allMessages.push(message);
  }

  addClient(id: string, nickname: string): void {
    this.clients.push({ id: id, nickname: nickname });
  }

  getClients(): ChatClient[] {
    return this.clients;
  }

  getMessages(): string[] {
    return this.allMessages;
  }

  deleteClient(id: string): void {
    this.clients = this.clients.filter((c) => c.id !== id);
  }
}
