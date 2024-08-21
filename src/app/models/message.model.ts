export class Message {
  senderID!: string;
  creationTime!: number;
  content!: string;
  attachments!: string[]; //pdf, png, jpg, jpeg
  reactions!: string[];
  messageID!: string;

  constructor() {
    this.senderID = '';
    this.creationTime;
    this.content = '';
    this.attachments = [];
    this.reactions = [];
    this.messageID = '';
  }

  public toJSON() {
    return {
      senderID: this.senderID,
      creationTime: this.creationTime,
      content: this.content,
      attachments: this.attachments,
      reactions: this.reactions,
      messageID: this.messageID
    };
  }


}
