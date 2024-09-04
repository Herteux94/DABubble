export class Message {
  senderID!: string;
  senderName!: string;
  creationTime!: number;
  content!: string;
  attachments!: string[]; //pdf, png, jpg, jpeg
  reactions!: string[];
  messageID!: string;

  constructor() {
    this.senderID = '';
    this.senderName = '';
    this.creationTime;
    this.content = '';
    this.attachments = [];
    this.reactions = [];
    this.messageID = '';
  }

  public toJSON() {
    return {
      senderID: this.senderID,
      senderName: this.senderName,
      creationTime: this.creationTime,
      content: this.content,
      attachments: this.attachments,
      reactions: this.reactions,
      messageID: this.messageID,
    };
  }
}
