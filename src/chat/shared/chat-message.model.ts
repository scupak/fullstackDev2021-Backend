import { ChatClient } from './chat-client.model';
import { MessageDTO } from './MessageDTO';

export interface ChatMessage {
  message: MessageDTO;
  sender: ChatClient;
}
