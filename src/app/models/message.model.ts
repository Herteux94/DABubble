export class Message {
  senderID!: string;
  senderName!: string;
  creationTime!: number;
  content!: string;
  attachments!: string[]; //pdf, png, jpg, jpeg
  reactions!: string[];
  messageID!: string;
  threadLength!: number;
  lastAnswer!: number;

  constructor() {
    this.senderID = '';
    this.senderName = '';
    this.creationTime = Date.now();
    this.content = '';
    this.attachments = [];
    this.reactions = [];
    this.messageID = '';
    this.threadLength = 0;
    this.lastAnswer = Date.now();
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
      threadLength: this.threadLength,
      lastAnswer: this.lastAnswer,
    };
  }
}
