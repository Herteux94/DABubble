export class Message {
  senderID!: string;
  creationTime!: number | undefined;
  content?: string;
  attachments?: any; //pdf, png, jpg, jpeg
  reactions?: any[];
  responses?: string[];
  messageID!: string;

  constructor() {
    this.senderID = '';
    this.creationTime = undefined;
    this.content = '';
    this.attachments = '';
    this.reactions = [];
    this.responses = [];
    this.messageID = '';
  }

  public toJSON() {
    return {
      messageID: this.messageID,
      senderID: this.senderID,
      creationTime: this.creationTime,
      content: this.content,
      attachments: this.attachments,
      reactions: this.reactions,
      responses: this.responses,
    };
  }


}
