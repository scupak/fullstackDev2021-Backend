import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './shared/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Client from '../database/client.entity';
import { Message } from '../database/message.entity';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [TypeOrmModule.forFeature([Client, Message])],
})
export class ChatModule {}
