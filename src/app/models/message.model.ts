import { serverTimestamp } from '@angular/fire/firestore';

export class Message {
  senderID!: string;
  creationTime!: any;
  content!: string;
  attachments!: string[]; //pdf, png, jpg, jpeg
  reactions!: { emoji: string; count: number; users: string[] }[];
  messageID!: string;
  threadLength!: number;
  lastAnswer!: any;

  constructor() {
    this.senderID = '';
    this.creationTime = serverTimestamp();
    this.content = '';
    this.attachments = [];
    this.reactions = [];
    this.messageID = '';
    this.threadLength = 0;
    this.lastAnswer = serverTimestamp();
  }

  public toJSON() {
    return {
      senderID: this.senderID,
      creationTime: this.creationTime,
      content: this.content,
      attachments: this.attachments,
      reactions: this.reactions.map((reaction) => ({
        emoji: reaction.emoji,
        count: reaction.count,
        users: reaction.users,
      })),
      messageID: this.messageID,
      threadLength: this.threadLength,
      lastAnswer: this.lastAnswer,
    };
  }
}
