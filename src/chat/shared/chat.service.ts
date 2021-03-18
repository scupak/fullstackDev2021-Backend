import { Injectable } from '@nestjs/common';
import { ChatClient } from './chat-client.model';
import { ChatMessage } from './chat-message.model';
import { MessageDTO } from './MessageDTO';
import SocketIO, { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import Client from '../../database/client.entity';
import { Repository } from 'typeorm';
import { json } from 'express';
import { Message } from '../../database/message.entity';
@Injectable()
export class ChatService {
  allMessages: ChatMessage[] = [];
  clients: ChatClient[] = [];
  typingClients: ChatClient[] = [];

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async addMessage(
    message: MessageDTO,
    clientId: string,
  ): Promise<ChatMessage> {
    const client = await this.clientRepository.findOne({
      id: clientId,
    });
    let messageDb = this.messageRepository.create();

    messageDb.senderId = clientId;
    messageDb.sender = client.nickname;
    messageDb.message = message.message;
    messageDb.date = new Date(message.date);

    messageDb = await this.messageRepository.save(messageDb);
    return {
      message: { message: messageDb.message, date: messageDb.date },
      sender: { id: messageDb.senderId, nickname: messageDb.sender },
    };
  }

  async addClient(id: string, nickname: string): Promise<ChatClient> {
    const clientdb = await this.clientRepository.findOne({
      nickname: nickname,
    });
    if (!clientdb) {
      let client = this.clientRepository.create();
      client.id = id;
      client.nickname = nickname;
      client = await this.clientRepository.save(client);

      return { id: client.id, nickname: client.nickname };
    }
    if (clientdb.id === id) {
      return { id: clientdb.id, nickname: clientdb.nickname };
    } else {
      throw new Error('Nickname already used');
    }
    /*  const chatClient = this.clients.find(
      (c) => c.nickname === nickname && c.id === id,
    );

    if (chatClient) {
      return chatClient;
    }
    if (this.clients.find((c) => c.nickname === nickname)) {
      throw new Error('Nickname already used');
    }*/
    //chatClient = { id: id, nickname: nickname };
    //this.clients.push(chatClient);
  }

  async getClients(): Promise<ChatClient[]> {
    const clients = await this.clientRepository.find();
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clients));
    return chatClients;
  }

  async getMessages(): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.find();
    //const chatmessages: [] = JSON.parse(JSON.stringify(messages));

    const chatmessages: ChatMessage[] = [];

    for (const m of messages) {
      chatmessages.push({
        message: { message: m.message, date: m.date },
        sender: { id: m.senderId, nickname: m.sender },
      });
    }

    return chatmessages;
  }

  async deleteClient(id: string): Promise<void> {
    this.typingClients = this.typingClients.filter((c) => c.id !== id);
    this.clients = this.clients.filter((c) => c.id !== id);
    await this.clientRepository.delete({ id: id });
  }

  async typing(typing: boolean, client: Socket): Promise<ChatClient[]> {
    // const chatClient = this.clients.find((c) => c.id == client.id);

    const clientdb = await this.clientRepository.findOne({
      id: client.id,
    });

    if (typing) {
      if (!this.typingClients.find((c) => c.id == client.id)) {
        this.typingClients.push({
          id: clientdb.id,
          nickname: clientdb.nickname,
        });
        return this.typingClients;
      } else {
        return this.typingClients;
      }
    } else {
      if (this.typingClients.find((c) => c.id == client.id)) {
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
