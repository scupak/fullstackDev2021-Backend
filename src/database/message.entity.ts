import { MessageDTO } from '../chat/shared/MessageDTO';
import { ChatClient } from '../chat/shared/chat-client.model';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  private id: number;
  @Column()
  message: string;
  @Column()
  date: Date;
  @Column()
  public sender: string;
  @Column()
  public senderId: string;
}
