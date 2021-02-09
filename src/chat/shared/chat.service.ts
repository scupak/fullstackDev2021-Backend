import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  allMessages: string[] = [];
  clients: Map<string, string> = new Map<string, string>();

  addMessage(message: string): void {
    this.allMessages.push(message);
  }

  addClient(id: string, nickname: string): void {
    this.clients.set(id, nickname);
  }

  getClients(): string[] {
    return Array.from(this.clients.values());
  }

  getMessages(): string[] {
    return this.allMessages;
  }

  deleteClient(id: string): void {
    this.clients.delete(id);
  }
}